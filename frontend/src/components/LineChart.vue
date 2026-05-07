<template>
  <section class="chart-card line-card">
    <div class="card-title">
      <h3>Suchinteresse im Zeitverlauf</h3>
    </div>

    <div class="legend">
      <span v-for="term in terms" :key="term.name">
        <b :style="{ background: term.color }"></b>{{ term.name }}
      </span>
    </div>

    <div class="line-chart-wrapper" @mousemove="onMouseMove" @mouseleave="tooltip.visible = false">
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

        <!-- Hover Linie -->
        <line
            v-if="tooltip.visible"
            :x1="tooltip.svgX"
            :x2="tooltip.svgX"
            y1="30"
            y2="180"
            stroke="#667085"
            stroke-width="1"
            stroke-dasharray="4"
        />

        <!-- Hover Punkte -->
        <circle
            v-for="pt in tooltip.points"
            :key="pt.name"
            :cx="tooltip.svgX"
            :cy="pt.y"
            r="4"
            :fill="pt.color"
        />

        <text
            v-for="item in visibleLabels"
            :key="item.label"
            :x="item.x"
            y="222"
            class="date"
        >{{ item.label }}</text>
      </svg>

      <!-- Tooltip Box -->
      <div
          v-if="tooltip.visible"
          class="line-tooltip"
          :style="{ left: tooltip.x + 'px', top: tooltip.y + 'px' }"
      >
        <div class="tooltip-date">{{ tooltip.label }}</div>
        <div v-for="pt in tooltip.points" :key="pt.name" class="tooltip-row">
          <span class="tooltip-dot" :style="{ background: pt.color }"></span>
          <span>{{ pt.name }}</span>
          <strong>{{ pt.value }}</strong>
        </div>
      </div>
    </div>
  </section>
</template>

<script setup>
import { computed, ref, reactive } from "vue"

const props = defineProps({
  terms: { type: Array, required: true },
  labels: { type: Array, required: true }
})

const chartStartX = 55
const chartEndX = 625
const chartWidth = chartEndX - chartStartX
const topY = 30
const bottomY = 180

const tooltip = reactive({
  visible: false,
  x: 0,
  y: 0,
  svgX: 0,
  label: '',
  points: []
})

function createPoints(values) {
  if (values.length === 1) {
    const y = bottomY - (Number(values[0]) / 100) * (bottomY - topY)
    return `${chartStartX},${y} ${chartEndX},${y}`
  }
  const step = chartWidth / (values.length - 1)
  return values.map((v, i) => {
    const x = chartStartX + i * step
    const y = bottomY - (Number(v) / 100) * (bottomY - topY)
    return `${x},${y}`
  }).join(" ")
}

function onMouseMove(e) {
  const wrapper = e.currentTarget
  const rect = wrapper.getBoundingClientRect()
  const mouseX = e.clientX - rect.left
  const mouseY = e.clientY - rect.top

  // SVG koordinaten berechnen
  const svgWidth = rect.width
  const svgX = chartStartX + ((mouseX / svgWidth) * 640 - chartStartX)

  if (svgX < chartStartX || svgX > chartEndX) {
    tooltip.visible = false
    return
  }

  const count = props.labels.length
  if (count === 0) return

  const step = chartWidth / (count - 1)
  const index = Math.round((svgX - chartStartX) / step)
  const clampedIndex = Math.max(0, Math.min(count - 1, index))

  const exactX = chartStartX + clampedIndex * step

  tooltip.visible = true
  tooltip.svgX = exactX
  tooltip.label = props.labels[clampedIndex] || ''
  tooltip.x = mouseX + 12
  tooltip.y = mouseY - 10
  tooltip.points = props.terms.map(term => {
    const val = term.values[clampedIndex] ?? 0
    const y = bottomY - (Number(val) / 100) * (bottomY - topY)
    return { name: term.name, value: val, color: term.color, y }
  })
}

const visibleLabels = computed(() => {
  const count = props.labels.length
  if (count === 1) return [{ label: props.labels[0], x: chartStartX }]
  if (count <= 5) {
    return props.labels.map((label, i) => ({
      label,
      x: i === count - 1 ? chartEndX - 30 : chartStartX + i * (chartWidth / (count - 1))
    }))
  }
  if (count <= 15) {
    return props.labels
        .map((label, i) => ({
          label,
          x: i === count - 1 ? chartEndX - 30 : chartStartX + i * (chartWidth / (count - 1))
        }))
        .filter((_, i) => i % 3 === 0 || i === count - 1)
  }
  return props.labels
      .map((label, i) => ({
        label,
        x: i === count - 1 ? chartEndX - 35 : chartStartX + i * (chartWidth / (count - 1))
      }))
      .filter((_, i) => i % 7 === 0)
})
</script>