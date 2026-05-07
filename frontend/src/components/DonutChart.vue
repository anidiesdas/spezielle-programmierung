<template>
  <section class="chart-card donut-card">
    <div class="card-title">
      <h3>Peaks im Zeitverlauf (Höchster Wert)</h3>
    </div>

    <div class="donut-layout">
      <div class="donut" :style="{ background: donutGradient }">
        <div class="donut-center">{{ highestPeak }}</div>
      </div>

      <div class="donut-legend">
        <p v-for="term in sortedTerms" :key="term.name">
          <b :style="{ background: term.color }"></b>
          {{ term.name }}
          <strong>{{ term.peak }}</strong>
        </p>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue"

const props = defineProps({
  terms: { type: Array, required: true }
})

const highestPeak = computed(() => Math.max(...props.terms.map(t => t.peak)))

const sortedTerms = computed(() => [...props.terms].sort((a, b) => b.peak - a.peak))

const donutGradient = computed(() => {
  const total = props.terms.reduce((sum, t) => sum + t.peak, 0)
  let currentAngle = 0
  const segments = props.terms.map(term => {
    const angle = (term.peak / total) * 360
    const segment = `${term.color} ${currentAngle}deg ${currentAngle + angle}deg`
    currentAngle += angle
    return segment
  })
  return `conic-gradient(${segments.join(", ")})`
})
</script>