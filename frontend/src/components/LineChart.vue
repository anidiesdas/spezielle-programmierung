<template>
  <section class="chart-card line-card">
    <div class="card-title">
      <h3>Suchinteresse im Zeitverlauf</h3>
      <span>ⓘ</span>
    </div>

    <div class="legend">
      <span v-for="term in terms" :key="term.name">
        <b :style="{ background: term.color }"></b>{{ term.name }}
      </span>
    </div>

    <svg viewBox="0 0 640 230" class="line-svg">
      <text x="20" y="32">100</text>
      <text x="28" y="82">75</text>
      <text x="28" y="132">50</text>
      <text x="28" y="182">25</text>
      <text x="34" y="222">0</text>

      <polyline class="grid-line" points="55,30 625,30" />
      <polyline class="grid-line" points="55,80 625,80" />
      <polyline class="grid-line" points="55,130 625,130" />
      <polyline class="grid-line" points="55,180 625,180" />

      <polyline
          v-for="term in terms"
          :key="term.name"
          class="line"
          :points="createPoints(term.values)"
          :style="{ stroke: term.color }"
      />

      <text
          v-for="item in visibleLabels"
          :key="item.label"
          :x="item.x"
          y="222"
          class="date"
      >
        {{ item.label }}
      </text>
    </svg>
  </section>
</template>

<script setup>
import { computed } from "vue";

const props = defineProps({
  terms: {
    type: Array,
    required: true,
  },
  labels: {
    type: Array,
    required: true,
  },
});

const chartStartX = 55;
const chartEndX = 625;
const chartWidth = chartEndX - chartStartX;

function createPoints(values) {
  const topY = 30;
  const bottomY = 180;

  if (values.length === 1) {
    const y = bottomY - (Number(values[0]) / 100) * (bottomY - topY);
    return `${chartStartX},${y} ${chartEndX},${y}`;
  }

  const step = chartWidth / (values.length - 1);

  return values
      .map((value, index) => {
        const x = chartStartX + index * step;
        const y = bottomY - (Number(value) / 100) * (bottomY - topY);
        return `${x},${y}`;
      })
      .join(" ");
}

const visibleLabels = computed(() => {
  const count = props.labels.length;

  if (count === 1) {
    return [{ label: props.labels[0], x: chartStartX }];
  }

  if (count <= 5) {
    return props.labels.map((label, index) => ({
      label,
      x:
          index === count - 1
              ? chartEndX - 30
              : chartStartX + index * (chartWidth / (count - 1)),
    }));
  }

  if (count <= 15) {
    return props.labels
        .map((label, index) => ({
          label,
          x:
              index === count - 1
                  ? chartEndX - 30
                  : chartStartX + index * (chartWidth / (count - 1)),
        }))
        .filter((_, index) => index % 3 === 0 || index === count - 1);
  }

  return props.labels
      .map((label, index) => ({
        label,
        x:
            index === count - 1
                ? chartEndX - 35
                : chartStartX + index * (chartWidth / (count - 1)),
      }))
      .filter((_, index) => index % 7 === 0);
});
</script>
});