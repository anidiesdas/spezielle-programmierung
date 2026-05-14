<template>
  <section class="chat-page">
    <div class="chat-container">
      <div class="messages">
        <div
            v-for="chat in chats"
            :key="chat.id"
            :class="chat.role === 'user' ? 'user-message' : 'bot-message'"
        >
          {{ chat.text }}
        </div>
      </div>

      <div class="chat-input">
        <input
            v-model="message"
            type="text"
            placeholder="Stelle deine Frage..."
            @keyup.enter="sendMessage"
        />

        <button @click="sendMessage">
          Senden
        </button>
      </div>
    </div>
  </section>
</template>

<script setup>
import { ref } from 'vue'
import axios from 'axios'

const message = ref('')

const chats = ref([
  {
    id: 1,
    role: 'bot',
    text: 'Ich analysiere Trends schneller als dein Gym-Bro neue Booster testet 💊'
  }
])

const sendMessage = async () => {
  const userQuestion = String(message.value).trim()

  if (!userQuestion) return

  chats.value.push({
    id: Date.now(),
    role: 'user',
    text: userQuestion
  })

  message.value = ''

  try {
    const response = await axios.post('http://ai.localhost/chat', {
      question: userQuestion
    })

    const botAnswer =
        response?.data?.['answer'] || 'Ich habe leider keine passende Antwort erhalten.'

    chats.value.push({
      id: Date.now() + 1,
      role: 'bot',
      text: botAnswer
    })
  } catch (error) {
    chats.value.push({
      id: Date.now() + 1,
      role: 'bot',
      text: 'Ich konnte den AI-Service gerade nicht erreichen. Bitte prüfe, ob der AI-Service läuft ⚠️'
    })

    console.error(error)
  }
}
</script>

<style scoped>
.chat-page {
  height: 100%;
  padding: 32px;
}

.chat-container {
  display: flex;
  flex-direction: column;
  height: calc(100vh - 120px);
  background: white;
  border-radius: 24px;
  border: 1px solid #e5e7eb;
  overflow: hidden;
}

.messages {
  flex: 1;
  padding: 24px;
  overflow-y: auto;
}

.bot-message {
  max-width: 550px;
  margin-bottom: 14px;
  background: #eef2ff;
  color: #1e3a8a;
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
}

.user-message {
  max-width: 550px;
  margin-left: auto;
  margin-bottom: 14px;
  background: #4f46e5;
  color: white;
  padding: 14px 18px;
  border-radius: 18px;
  font-size: 15px;
  line-height: 1.5;
}

.chat-input {
  display: flex;
  gap: 12px;
  padding: 20px;
  border-top: 1px solid #e5e7eb;
  background: white;
}

.chat-input input {
  flex: 1;
  padding: 14px 18px;
  border-radius: 14px;
  border: 1px solid #d1d5db;
  outline: none;
  font-size: 15px;
}

.chat-input input:focus {
  border-color: #4f46e5;
}

.chat-input button {
  padding: 14px 22px;
  border: none;
  border-radius: 14px;
  background: #4f46e5;
  color: white;
  cursor: pointer;
  font-weight: 600;
  transition: 0.2s;
}

.chat-input button:hover {
  background: #4338ca;
}
</style>