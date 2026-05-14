<template>
  <main class="plan-page">
    <header class="plan-header">
      <h1>Erstelle deinen persönlichen Supplement-Plan</h1>
      <p>Gib deine Daten ein und erhalte einen auf dich zugeschnittenen Wochenplan.</p>
    </header>

    <section class="plan-form-card">
      <div class="form-grid">

        <div class="form-group">
          <label>Alter</label>
          <input v-model="form.age" type="number" placeholder="z.B. 25" min="10" max="99" />
        </div>

        <div class="form-group">
          <label>Geschlecht</label>
          <select v-model="form.gender">
            <option value="" disabled>Bitte wählen</option>
            <option value="männlich">Männlich</option>
            <option value="weiblich">Weiblich</option>
            <option value="divers">Divers</option>
          </select>
        </div>

        <div class="form-group">
          <label>Gewicht (kg)</label>
          <input v-model="form.weight" type="number" placeholder="z.B. 70" min="30" max="250" />
        </div>

        <div class="form-group">
          <label>Körpergröße (cm)</label>
          <input v-model="form.height" type="number" placeholder="z.B. 175" min="100" max="250" />
        </div>

        <div class="form-group full-width">
          <label>Ziele <span class="optional">(mehrere möglich)</span></label>
          <div class="goal-buttons">
            <button
                v-for="goal in goals"
                :key="goal.value"
                class="goal-btn"
                :class="{ active: form.goals.includes(goal.value) }"
                @click="toggleGoal(goal.value)"
            >
              {{ goal.icon }} {{ goal.label }}
            </button>
          </div>
        </div>

        <div class="form-group full-width">
          <label>Aktivitätslevel</label>
          <div class="goal-buttons">
            <button
                v-for="level in activityLevels"
                :key="level.value"
                class="goal-btn"
                :class="{ active: form.activity === level.value }"
                @click="form.activity = level.value"
            >
              {{ level.label }}
            </button>
          </div>
        </div>

        <div class="form-group full-width">
          <label>Welche Supplements nimmst du bereits?</label>
          <div class="supplement-checkboxes">
            <label v-for="s in availableSupplements" :key="s" class="checkbox-label">
              <input type="checkbox" :value="s" v-model="form.currentSupplements" />
              {{ s }}
            </label>
          </div>
        </div>

        <div class="form-group full-width">
          <label>Weitere Supplements <span class="optional">(optional)</span></label>
          <input
              v-model="form.additionalSupplements"
              type="text"
              placeholder="z.B. Ashwagandha, L-Carnitin, Biotin..."
          />
        </div>

        <div class="form-group full-width">
          <label>Gesundheitliche Hinweise <span class="optional">(optional)</span></label>
          <textarea v-model="form.notes" placeholder="z.B. Laktoseintoleranz, Vegetarier, Allergien..." rows="3"></textarea>
        </div>

      </div>

      <button class="generate-btn" @click="generatePlan" :disabled="loading || !isFormValid">
        <span v-if="loading">⏳ Plan wird erstellt...</span>
        <span v-else>✨ Plan erstellen</span>
      </button>
    </section>

    <!-- Ergebnis -->
    <section v-if="plan" class="plan-result-card">
      <div class="plan-result-header">
        <h2>Dein persönlicher Supplement-Plan</h2>
        <button class="download-btn" @click="downloadPDF">⬇ Als PDF herunterladen</button>
      </div>
      <div class="plan-text" v-html="renderedPlan"></div>
    </section>

  </main>
</template>

<script setup>
import { ref, computed } from 'vue'
import { marked } from 'marked'
import { getMetrics } from '../services/api.js'

const AI_SERVICE_URL = 'http://ai.localhost'

const form = ref({
  age: '',
  gender: '',
  weight: '',
  height: '',
  goals: [],
  activity: '',
  currentSupplements: [],
  additionalSupplements: '',
  notes: ''
})

const goals = [
  { value: 'muskelaufbau', label: 'Muskelaufbau', icon: '💪' },
  { value: 'abnehmen', label: 'Abnehmen', icon: '🔥' },
  { value: 'gesundheit', label: 'Allgemeine Gesundheit', icon: '❤️' },
  { value: 'ausdauer', label: 'Ausdauer & Sport', icon: '🏃' },
]

const activityLevels = [
  { value: 'wenig', label: '🛋 Wenig aktiv' },
  { value: 'moderat', label: '🚶 Moderat aktiv' },
  { value: 'aktiv', label: '🏋️ Aktiv' },
  { value: 'sehr_aktiv', label: '⚡ Sehr aktiv' },
]

const availableSupplements = [
  'Whey Protein', 'Vitamin D', 'Omega 3', 'Kreatin', 'Kollagen',
  'Magnesium', 'Zink', 'B12', 'Melatonin', 'Eisen'
]

const loading = ref(false)
const plan = ref('')

const isFormValid = computed(() =>
    form.value.age && form.value.gender && form.value.weight && form.value.goals.length > 0
)

const renderedPlan = computed(() => plan.value ? marked(plan.value) : '')

function toggleGoal(value) {
  const idx = form.value.goals.indexOf(value)
  if (idx === -1) form.value.goals.push(value)
  else form.value.goals.splice(idx, 1)
}

async function generatePlan() {
  loading.value = true
  plan.value = ''
  try {
    const metricsData = await getMetrics()

    const response = await fetch(`${AI_SERVICE_URL}/personalize`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        profile: form.value,
        metrics: metricsData.terms
      })
    })

    const data = await response.json()
    plan.value = data.plan

  } catch (err) {
    plan.value = 'Fehler beim Erstellen des Plans. Bitte versuche es erneut.'
    console.error(err)
  } finally {
    loading.value = false
  }
}

async function downloadPDF() {
  const { default: html2pdf } = await import('html2pdf.js')
  const element = document.querySelector('.plan-text')
  html2pdf()
      .set({
        margin: 16,
        filename: 'mein-supplement-plan.pdf',
        html2canvas: { scale: 2 },
        jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' }
      })
      .from(element)
      .save()
}
</script>

<style scoped>
.plan-page {
  width: 100%;
  max-width: 860px;
}

.plan-header {
  margin-bottom: 24px;
}

.plan-header h1 {
  margin: 0;
  font-size: 28px;
  font-weight: 800;
  letter-spacing: -0.03em;
}

.plan-header p {
  margin: 8px 0 0;
  color: #667085;
  font-size: 14px;
}

.plan-form-card, .plan-result-card {
  background: #ffffff;
  border: 1px solid #e6ebf2;
  border-radius: 16px;
  padding: 28px;
  margin-bottom: 20px;
}

.form-grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20px;
  margin-bottom: 24px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.full-width {
  grid-column: 1 / -1;
}

label {
  font-size: 13px;
  font-weight: 700;
  color: #344054;
}

.optional {
  font-weight: 400;
  color: #98a2b3;
}

input, select, textarea {
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  padding: 10px 12px;
  font-size: 13px;
  color: #344054;
  background: #f7f9fd;
  outline: none;
  font-family: inherit;
}

input:focus, select:focus, textarea:focus {
  border-color: #1557ff;
  background: #ffffff;
}

textarea { resize: vertical; }

.goal-buttons {
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.goal-btn {
  padding: 8px 16px;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  background: #f7f9fd;
  font-size: 13px;
  font-weight: 600;
  color: #344054;
  cursor: pointer;
}

.goal-btn.active {
  background: #eef4ff;
  border-color: #1557ff;
  color: #1557ff;
  font-weight: 700;
}

.supplement-checkboxes {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  font-weight: 600;
  color: #344054;
  cursor: pointer;
}

.checkbox-label input { width: 15px; height: 15px; cursor: pointer; }

.generate-btn {
  width: 100%;
  height: 48px;
  background: #1557ff;
  color: #ffffff;
  border: none;
  border-radius: 10px;
  font-size: 15px;
  font-weight: 700;
  cursor: pointer;
}

.generate-btn:disabled {
  background: #d0d5dd;
  cursor: not-allowed;
}

.generate-btn:hover:not(:disabled) {
  background: #1144dd;
}

.plan-result-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.plan-result-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 700;
}

.download-btn {
  background: #f7f9fd;
  border: 1px solid #e6ebf2;
  border-radius: 8px;
  padding: 8px 16px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
  color: #344054;
}

.download-btn:hover {
  background: #eef4ff;
  color: #1557ff;
  border-color: #1557ff;
}

.plan-text {
  font-size: 14px;
  line-height: 1.7;
  color: #344054;
}

.plan-text ul {
  list-style: disc;
  padding-left: 20px;
}

.plan-text li {
  margin-bottom: 6px;
}

.plan-text strong {
  color: #111827;
}

.plan-text h2 {
  font-size: 16px;
  font-weight: 800;
  margin: 20px 0 10px;
  color: #111827;
}

.plan-text hr {
  border: none;
  border-top: 1px solid #e6ebf2;
  margin: 20px 0;
}
</style>