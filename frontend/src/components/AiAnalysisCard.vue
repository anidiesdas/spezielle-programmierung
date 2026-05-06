<template>
  <section class="ai-card">
    <h3>✨ AI-Analyse</h3>

    <p>
      <strong :style="{ color: bestAverage.color }">
        {{ bestAverage.name }}
      </strong>
      hat mit Ø {{ bestAverage.average }} den höchsten durchschnittlichen
      Suchwert.
    </p>

    <p>
      Der höchste Peak wurde mit
      <strong>{{ highestPeak.peak }}</strong>
      von
      <strong :style="{ color: highestPeak.color }">
        {{ highestPeak.name }}
      </strong>
      erreicht.
    </p>

    <p>
      Der aktuell stärkste Trend ist
      <strong :style="{ color: risingTrend.color }">
        {{ risingTrend.name }}
      </strong>.
    </p>

    <p>
      Aktuell werden
      <strong>{{ activeCount }}</strong>
      Supplements analysiert.
    </p>
  </section>
</template>

<script setup>
defineProps({
  bestAverage: {
    type: Object,
    required: true,
  },
  highestPeak: {
    type: Object,
    required: true,
  },
  risingTrend: {
    type: Object,
    required: true,
  },
  activeCount: {
    type: Number,
    required: true,
  },
});
</script>