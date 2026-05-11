const express = require('express')
const cors = require('cors')
const OpenAI = require('openai')

const app = express()
app.use(cors())
app.use(express.json())

app.get('/analysis', async (req, res) => {
    try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
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
            analysis: aiResponse.choices[0].message.content
        })

    } catch (error) {
        res.status(500).json({
            error: 'AI Service Fehler',
            details: error.message
        })
    }
})

app.post('/personalize', async (req, res) => {
    try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const { profile, metrics } = req.body

        const prompt = `
        Du bist ein erfahrener Supplement-Experte und Ernährungsberater. Erstelle einen personalisierten Wochenplan auf Deutsch.
        
        Nutzerprofil:
        - Alter: ${profile.age} Jahre
        - Geschlecht: ${profile.gender}
        - Gewicht: ${profile.weight} kg
        - Größe: ${profile.height} cm
        - Ziel: ${profile.goal}
        - Aktivitätslevel: ${profile.activity}
        - Supplements: ${profile.currentSupplements.join(', ') || 'keine'}
        - Weitere Supplements: ${profile.additionalSupplements || 'keine'}
        - Hinweise: ${profile.notes || 'keine'}
        
        Aktuelle Google Trends Daten (Deutschland):
        ${JSON.stringify(metrics)}
        
        Antworte GENAU in diesem Format:
        
        ## Deine Supplements im Überblick
        
        Für jedes Supplement eine kurze Erklärung in diesem Format:
        **[Name]** – Für wen geeignet: [wer sollte es nehmen und wer nicht]. Empfohlene Dosis: [Menge und Frequenz – z.B. täglich, alle 3 Tage, in Kuren]. Beste Einnahme: [mit/ohne Essen, Tageszeit, Hinweise].
        
        Wichtige Dosierungsregel: Der Nutzer hat keinen nachgewiesenen Mangel und fängt neu mit Supplements an. Empfehle daher immer die niedrigste sinnvolle Erhaltungsdosis — nicht die therapeutische Dosis für Mängel. Zum Beispiel Vitamin D eher 800-1000 IU statt 2000-4000 IU, Zink eher 10-15 mg statt 25-50 mg. Ziel ist ein gesunder Einstieg ohne Überdosierung.
        
        Markiere Supplements die nur situativ oder optional eingenommen werden sollten mit einem ⚠️ am Anfang. Zum Beispiel: Melatonin nur bei Einschlafproblemen, Eisen nur bei nachgewiesenem Mangel, B12 nur bei veganer Ernährung oder Mangel. Erkläre kurz wann diese Supplements sinnvoll sind.
        
        ---
        
        ## Dein Wochenplan
        
        Für jeden Wochentag (Montag bis Sonntag) in diesem Format:
        
        **Montag**
        - 🌅 Morgens nüchtern: [Supplement Dosis]
        - 🍽️ Mit Frühstück: [Supplement Dosis]
        - ☀️ Mittags: [Supplement Dosis]
        - 🌙 Abends: [Supplement Dosis]
        
        Verteile die Supplements sinnvoll. Nicht jedes Supplement muss jeden Tag eingenommen werden. Zeige das im Plan. Sei sehr konkret mit Mengen. Keine langen Erklärungen im Wochenplan selbst.
        `

        const aiResponse = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [{ role: 'user', content: prompt }]
        })

        res.json({ plan: aiResponse.choices[0].message.content })

    } catch (error) {
        res.status(500).json({ error: error.message })
    }
})

app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

app.post('/chat', async (req, res) => {
    try {
        const client = new OpenAI({ apiKey: process.env.OPENAI_API_KEY })
        const { question } = req.body

        if (!question || !question.trim()) {
            return res.status(400).json({
                answer: 'Bitte stelle eine konkrete Frage.'
            })
        }

        const aiResponse = await client.chat.completions.create({
            model: 'gpt-4o-mini',
            messages: [
                {
                    role: 'system',
                    content: `
                    Du bist der Chat-Assistent der App "Supplement Trends".
                    Antworte auf Deutsch, kurz, verständlich und freundlich.

                    Deine Grenzen:
                    - Beantworte nur Fragen zu Supplements, Fitness-Trends, Google-Trends-Daten, Ernährung und Wochenplanung.
                    - Gib keine medizinische Diagnose.
                    - Empfiehl bei gesundheitlichen Beschwerden einen Arzt oder eine Ärztin.
                    - Wenn eine Frage nicht zum Thema passt, sage höflich, dass du dazu keine passende Antwort geben kannst.
                    `
                },
                {
                    role: 'user',
                    content: question
                }
            ]
        })

        res.json({
            answer: aiResponse.choices[0].message.content
        })

    } catch (error) {
        res.status(500).json({
            answer: 'Ich konnte deine Frage gerade nicht beantworten. Bitte versuche es später erneut.',
            details: error.message
        })
    }
})

app.listen(8001, () => console.log('AI Service läuft auf Port 8001'))

// TODO chat bot api