<template>
  <section class="term-card">
    <h3>Begriffe auswählen</h3>

    <button
        v-for="term in terms"
        :key="term.name"
        class="term-button"
        :class="{ active: term.active }"
        :style="{ '--term-color': term.color, '--term-bg': term.bg }"
        @click="$emit('toggle-term', term.name)"
    >
      <span>{{ term.name }}</span>
      <span class="term-dot">{{ term.active ? "✓" : "" }}</span>
    </button>
  </section>
</template>

<script setup>
defineProps({
  terms: {
    type: Array,
    required: true,
  },
});

defineEmits(["toggle-term"]);
</script>