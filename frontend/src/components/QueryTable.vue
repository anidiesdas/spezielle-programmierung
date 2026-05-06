<template>
  <section class="bottom-card">
    <div class="table-header">
      <h3>{{ title }}</h3>

      <select
          :value="selected"
          @change="$emit('update:selected', $event.target.value)"
      >
        <option
            v-for="term in terms"
            :key="term.name"
            :value="term.name"
        >
          {{ term.name }}
        </option>
      </select>
    </div>

    <table>
      <thead>
      <tr>
        <th>Rang</th>
        <th>Suchanfrage</th>
        <th>{{ growth ? "Zunahme" : "Interesse" }}</th>
      </tr>
      </thead>

      <tbody>
      <tr v-for="row in rows" :key="row.rank">
        <td>{{ row.rank }}</td>
        <td>{{ row.query }}</td>
        <td :class="{ growth: growth }">{{ row.value }}</td>
      </tr>
      </tbody>
    </table>

    <a class="show-more">Mehr anzeigen ›</a>
  </section>
</template>

<script setup>
defineProps({
  title: String,
  selected: String,
  terms: {
    type: Array,
    required: true,
  },
  rows: {
    type: Array,
    required: true,
  },
  growth: Boolean,
});

defineEmits(["update:selected"]);
</script>