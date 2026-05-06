<template>
  <article class="metric-card">
    <div>
      <p class="metric-label">{{ label }}</p>
      <h2 :style="{ color: color }">{{ title }}</h2>
      <p v-if="value" class="metric-value">{{ value }}</p>
    </div>

    <div
        class="metric-icon"
        :style="{ color: color, background: iconBackground }"
    >
      {{ icon }}
    </div>
  </article>
</template>

<script setup>
defineProps({
  label: String,
  title: String,
  value: String,
  icon: String,
  color: String,
  iconBackground: String,
});
</script>