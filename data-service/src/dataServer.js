const express = require('express')
const cors = require('cors')
const fs = require('fs')
const { parse } = require('csv-parse/sync')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

const TERMS = ['wheyprotein', 'vitamind', 'omega3', 'kreatin', 'kollagen']
const TERM_LABELS = {
    wheyprotein: 'Whey Protein',
    vitamind: 'Vitamin D',
    omega3: 'Omega 3',
    kreatin: 'Kreatin',
    kollagen: 'Kollagen'
}

function loadCSV(filename) {
    const filePath = path.join(__dirname, '../data', filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    return parse(content, { columns: true, skip_empty_lines: true, trim: true })
}

// Datenbereinigung: NBSP und andere unsichtbare Zeichen entfernen
function cleanNumber(val) {
    if (!val) return 0
    const cleaned = String(val).replace(/\u00a0/g, '').replace(/[^0-9.-]/g, '').trim()
    return parseInt(cleaned) || 0
}

function calcStats(data) {
    const terms = Object.keys(data[0]).filter(k =>
        k !== 'Time' && k !== 'time' && k !== 'Woche' &&
        k !== 'Tag' && k !== 'Datum' && k !== 'date' && k !== 'Week'
    )

    return terms.map(term => {
        const values = data.map(row => cleanNumber(row[term]))
        const mean = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        const peak = Math.max(...values)
        const half = Math.floor(values.length / 2)
        const firstHalf = Math.round(values.slice(0, half).reduce((a, b) => a + b, 0) / half)
        const secondHalf = Math.round(values.slice(half).reduce((a, b) => a + b, 0) / half)
        const trend = secondHalf > firstHalf + 5 ? 'steigend' : secondHalf < firstHalf - 5 ? 'fallend' : 'stabil'
        const total = values.reduce((a, b) => a + b, 0)

        return { term, mean, peak, trend, firstHalf, secondHalf, total, values }
    })
}

// Stats: mean, peak, trend, total pro Begriff
app.get('/api/stats', (req, res) => {
    try {
        const data = loadCSV('interest_over_time.csv')
        const stats = calcStats(data)
        res.json({ stats })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Top Queries pro Begriff
app.get('/api/top-queries', (req, res) => {
    try {
        const result = {}
        TERMS.forEach(term => {
            try {
                const raw = loadCSV(`top_queries_${term}.csv`)
                result[term] = raw.map(row => ({
                    query: row['query'] || '',
                    searchInterest: cleanNumber(row['search interest']),
                    increasePercent: String(row['increase percent'] || '').replace(/\u00a0/g, '').trim()
                }))
            } catch {
                result[term] = []
            }
        })
        res.json({ data: result })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// Rising Queries pro Begriff
app.get('/api/rising-queries', (req, res) => {
    try {
        const result = {}
        TERMS.forEach(term => {
            try {
                const raw = loadCSV(`rising_queries_${term}.csv`)
                result[term] = raw.map(row => ({
                    query: row['query'] || '',
                    searchInterest: cleanNumber(row['search interest']),
                    increasePercent: String(row['increase percent'] || '').replace(/\u00a0/g, '').trim()
                }))
            } catch {
                result[term] = []
            }
        })
        res.json({ data: result })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(3001, () => console.log('Data Service läuft auf Port 3001'))