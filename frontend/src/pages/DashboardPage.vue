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

    <section class="dashboard-grid">
      <aside class="left-column">
        <TermSelector :terms="terms" @toggle-term="toggleTerm" />
        <AiAnalysisCard
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
          <LineChart
              :terms="activeTerms"
              :labels="filteredLabels"
          />
          <DonutChart :terms="activeTerms" />
        </section>

        <section class="bottom-grid">
          <RankingChart :terms="activeTerms" />

          <QueryTable
              title="Top Queries"
              v-model:selected="selectedTopQueryTerm"
              :terms="terms"
              :growth="false"
              :rows="queryRows[selectedTopQueryTerm]"
          />

          <QueryTable
              title="Rising Queries"
              v-model:selected="selectedRisingQueryTerm"
              :terms="terms"
              :growth="true"
              :rows="risingRows[selectedRisingQueryTerm]"
          />
        </section>
      </div>
    </section>
  </main>
</template>

<script setup>
import { computed, ref } from "vue";

import MetricCard from "../components/MetricCard.vue";
import TermSelector from "@/components/TermSelector.vue";
import AiAnalysisCard from "@/components/AiAnalysisCard.vue";
import LineChart from "@/components/LineChart.vue";
import DonutChart from "@/components/DonutChart.vue";
import QueryTable from "@/components/QueryTable.vue";
import RankingChart from "@/components/RankingChart.vue";

const selectedPeriod = ref("30");
const selectedTopQueryTerm = ref("Vitamin D");
const selectedRisingQueryTerm = ref("Kreatin");
const allDateLabels = [
  "13.03",
  "14.03",
  "15.03",
  "16.03",
  "17.03",
  "18.03",
  "19.03",
  "20.03",
  "21.03",
  "22.03",
  "23.03",
  "24.03",
  "25.03",
  "26.03",
  "27.03",
  "28.03",
  "29.03",
  "30.03",
  "31.03",
  "01.04",
  "02.04",
  "03.04",
  "04.04",
  "05.04",
  "06.04",
  "07.04",
  "08.04",
  "09.04",
  "10.04",
  "11.04",
];

const terms = ref([
  {
    name: "Vitamin D",
    color: "#1557ff",
    bg: "#eef4ff",
    active: true,
    average: 66.0,
    peak: 100,
    values: [68, 78, 71, 76, 66, 76, 69, 82, 85, 72, 79, 68, 78, 51, 70, 74, 81, 72, 76, 66, 100, 70, 76, 94],
  },
  {
    name: "Omega 3",
    color: "#43a047",
    bg: "#edf8ee",
    active: true,
    average: 53.3,
    peak: 99,
    values: [46, 54, 51, 58, 47, 55, 48, 58, 56, 53, 58, 54, 40, 51, 48, 55, 52, 58, 49, 54, 78, 46, 55, 67],
  },
  {
    name: "Kreatin",
    color: "#ec2f8c",
    bg: "#ffe8f3",
    active: true,
    average: 33.7,
    peak: 50,
    values: [25, 31, 29, 35, 26, 37, 31, 44, 31, 35, 29, 39, 41, 22, 33, 36, 40, 34, 38, 30, 53, 29, 33, 50],
  },
  {
    name: "Kollagen",
    color: "#e10436",
    bg: "rgba(165,9,44,0.06)",
    active: true,
    average: 28.4,
    peak: 45,
    values: [20, 24, 23, 28, 22, 29, 25, 31, 26, 30, 24, 33, 35, 21, 27, 30, 34, 29, 31, 26, 45, 28, 32, 39],
  },
  {
    name: "Whey Protein",
    color: "#8328a7",
    bg: "rgba(131,40,167,0.04)",
    active: true,
    average: 41.2,
    peak: 70,
    values: [35, 40, 38, 43, 36, 45, 39, 47, 44, 42, 48, 43, 50, 34, 41, 45, 49, 43, 47, 40, 70, 42, 46, 60],
  },
]);

const queryRows = {
  "Vitamin D": [
    { rank: 1, query: "vitamin d3", value: "100" },
    { rank: 2, query: "vitamin d mangel", value: "85" },
    { rank: 3, query: "vitamin d tabletten", value: "74" },
    { rank: 4, query: "vitamin d3 täglich", value: "66" },
    { rank: 5, query: "vitamin d dosierung", value: "59" },
  ],
  "Omega 3": [
    { rank: 1, query: "omega 3 kapseln", value: "100" },
    { rank: 2, query: "omega 3 wirkung", value: "88" },
    { rank: 3, query: "omega 3 lebensmittel", value: "75" },
    { rank: 4, query: "omega 3 tagesbedarf", value: "63" },
    { rank: 5, query: "omega 3 vegan", value: "52" },
  ],
  Kreatin: [
    { rank: 1, query: "kreatin monohydrat", value: "100" },
    { rank: 2, query: "kreatin wirkung", value: "91" },
    { rank: 3, query: "kreatin dosierung", value: "79" },
    { rank: 4, query: "kreatin einnahme", value: "68" },
    { rank: 5, query: "kreatin nebenwirkungen", value: "61" },
  ],
  Kollagen: [
    { rank: 1, query: "kollagen pulver", value: "100" },
    { rank: 2, query: "kollagen wirkung", value: "83" },
    { rank: 3, query: "kollagen haut", value: "72" },
    { rank: 4, query: "kollagen kapseln", value: "58" },
    { rank: 5, query: "kollagen trinken", value: "49" },
  ],
  "Whey Protein": [
    { rank: 1, query: "whey protein pulver", value: "100" },
    { rank: 2, query: "whey protein kaufen", value: "86" },
    { rank: 3, query: "whey protein isolate", value: "74" },
    { rank: 4, query: "whey protein ohne zucker", value: "62" },
    { rank: 5, query: "whey protein vegan", value: "55" },
  ],
};

const risingRows = {
  "Vitamin D": [
    { rank: 1, query: "vitamin d3 k2", value: "+120%" },
    { rank: 2, query: "vitamin d mangel symptome", value: "+100%" },
    { rank: 3, query: "vitamin d im winter", value: "+80%" },
    { rank: 4, query: "vitamin d hochdosiert", value: "+70%" },
    { rank: 5, query: "vitamin d blutwert", value: "+60%" },
  ],
  "Omega 3": [
    { rank: 1, query: "omega 3 vegan", value: "+130%" },
    { rank: 2, query: "omega 3 algenöl", value: "+115%" },
    { rank: 3, query: "omega 3 test", value: "+90%" },
    { rank: 4, query: "omega 3 kinder", value: "+75%" },
    { rank: 5, query: "omega 3 herz", value: "+65%" },
  ],
  Kreatin: [
    { rank: 1, query: "kreatin monohydrat", value: "+130%" },
    { rank: 2, query: "kreatin wirkung", value: "+110%" },
    { rank: 3, query: "kreatin nebenwirkungen", value: "+90%" },
    { rank: 4, query: "kreatin oder protein", value: "+80%" },
    { rank: 5, query: "kreatin dosierung", value: "+70%" },
  ],
  Kollagen: [
    { rank: 1, query: "kollagen pulver haut", value: "+105%" },
    { rank: 2, query: "kollagen anti aging", value: "+95%" },
    { rank: 3, query: "kollagen peptides", value: "+80%" },
    { rank: 4, query: "kollagen gelenke", value: "+70%" },
    { rank: 5, query: "kollagen erfahrung", value: "+60%" },
  ],
  "Whey Protein": [
    { rank: 1, query: "clear whey protein", value: "+125%" },
    { rank: 2, query: "whey protein isolate", value: "+100%" },
    { rank: 3, query: "whey protein angebot", value: "+85%" },
    { rank: 4, query: "whey protein ohne zucker", value: "+75%" },
    { rank: 5, query: "whey protein geschmack", value: "+65%" },
  ],
};

const periodLabel = computed(() => {
  if (selectedPeriod.value === "1") return "Letzter 1 Tag";
  return `Letzte ${selectedPeriod.value} Tage`;
});

const filteredTerms = computed(() => {
  const days = Number(selectedPeriod.value);

  return terms.value
      .filter((term) => term.active)
      .map((term) => {
        const filteredValues = term.values.slice(-days);

        const average =
            filteredValues.reduce((sum, value) => sum + value, 0) /
            filteredValues.length;

        const peak = Math.max(...filteredValues.map(Number));

        return {
          ...term,
          values: filteredValues,
          average: Number(average.toFixed(1)),
          peak,
        };
      });
});

const filteredLabels = computed(() => {
  const days = Number(selectedPeriod.value);

  return allDateLabels.slice(-days);
});

const activeTerms = computed(() => {
  return filteredTerms.value;
});

const bestAverageTerm = computed(() => {
  return [...activeTerms.value].sort((a, b) => b.average - a.average)[0];
});

const highestPeakTerm = computed(() => {
  return [...activeTerms.value].sort((a, b) => b.peak - a.peak)[0];
});

const risingTrendTerm = computed(() => {
  return activeTerms.value.find((term) => term.name === "Kreatin") || activeTerms.value[0];
});

function toggleTerm(termName) {
  const term = terms.value.find((item) => item.name === termName);

  if (!term) return;

  if (term.active && activeTerms.value.length === 1) return;

  term.active = !term.active;
}
</script>