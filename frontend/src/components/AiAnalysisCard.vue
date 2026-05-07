<template>
  <section class="ai-card">
    <h3>✨ AI-Analyse</h3>
    <div v-if="analysis" v-html="renderedAnalysis"></div>
    <template v-else>
      <!-- bisheriger Fallback Code -->
    </template>
  </section>
</template>

<script setup>
import { computed } from "vue"
import { marked } from "marked"

const props = defineProps({
  analysis: { type: String, default: "" },
  bestAverage: { type: Object, required: true },
  highestPeak: { type: Object, required: true },
  risingTrend: { type: Object, required: true },
  activeCount: { type: Number, required: true },
})

const renderedAnalysis = computed(() => marked(props.analysis))
</script>