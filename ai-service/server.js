const express = require('express')
const cors = require('cors')
const OpenAI = require('openai')

const app = express()
app.use(cors())

const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })

app.get('/analysis', async (req, res) => {
    try {
        const response = await fetch('http://data-service:3001/metrics')
        const data = await response.json()

        const prompt = `
        Analysiere folgende Google-Trends-Daten aus Deutschland:
        ${JSON.stringify(data)}
        
        Gib eine kurze datenbasierte Interpretation:
        - stärkste Begriffe
        - Trends
        - Auffälligkeiten
        - Unterschiede zwischen Begriffen
        
        Wichtig:
        - keine Fantasie
        - nur Aussagen auf Basis der Daten
        - kurz und verständlich
        `

        const aiResponse = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }]
        })

        res.json({
            // data,
            analysis: aiResponse.choices[0].message.content
        })

    } catch (error) {
        res.status(500).json({
            error: 'AI Service Fehler',
            details: error.message
        })
    }
})

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.listen(8001, () => console.log('AI Service läuft auf Port 8001'))