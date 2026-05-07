<template>
  <section class="bottom-card">
    <div class="card-title">
      <h3>Durchschnittliches Suchinteresse (Ranking)</h3>
    </div>

    <div
        v-for="term in sortedTerms"
        :key="term.name"
        class="ranking-row"
    >
      <span>{{ term.name }}</span>

      <div class="bar-bg">
        <div
            class="bar"
            :style="{
            width: `${term.average}%`,
            background: term.color
          }"
        ></div>
      </div>

      <strong>{{ term.average }}</strong>
    </div>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  terms: {
    type: Array,
    required: true,
  },
});

const sortedTerms = computed(() => {
  return [...props.terms].sort((a, b) => b.average - a.average);
});
</script>