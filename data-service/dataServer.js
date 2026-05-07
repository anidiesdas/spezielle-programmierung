const express = require('express')
const cors = require('cors')
const fs = require('fs')
const { parse } = require('csv-parse/sync')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

const TERMS = [
    { key: 'whey_protein', file: 'wheyprotein', label: 'Whey Protein' },
    { key: 'vitamin_d',    file: 'vitamind',    label: 'Vitamin D' },
    { key: 'omega_3',      file: 'omega3',      label: 'Omega 3' },
    { key: 'kreatin',      file: 'kreatin',     label: 'Kreatin' },
    { key: 'kollagen',     file: 'kollagen',    label: 'Kollagen' },
]

function loadCSV(filename) {
    const filePath = path.join(__dirname, 'data', filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    return parse(content, { columns: true, skip_empty_lines: true, trim: true })
}

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

    return terms.map(name => {
        const values = data.map(row => cleanNumber(row[name]))
        const mean = Math.round(values.reduce((a, b) => a + b, 0) / values.length * 10) / 10
        const peak = Math.max(...values)
        const first = values[0]
        const last = values[values.length - 1]
        const trend = last > first ? 'increasing' : last < first ? 'decreasing' : 'stable'
        const total = values.reduce((a, b) => a + b, 0)

        return { name, mean, peak, trend, total, values }
    })
}

// /metrics
app.get('/metrics', (req, res) => {
    try {
        const data = loadCSV('interest_over_time.csv')
        const terms = calcStats(data)
        res.json({ terms })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// /health
app.get('/health', (req, res) => {
    res.json({ status: 'ok' })
})

// /ranking
app.get('/ranking', (req, res) => {
    try {
        const data = loadCSV('interest_over_time.csv')
        const terms = calcStats(data)
        const ranking = terms
            .map(s => ({ name: s.name, total: s.total, mean: s.mean }))
            .sort((a, b) => b.total - a.total)
        res.json({ ranking })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// /top-queries
app.get('/top-queries', (req, res) => {
    try {
        const result = {}
        TERMS.forEach(term => {
            try {
                const raw = loadCSV(`top_queries_${term.file}.csv`)
                result[term.key] = raw.map(row => ({
                    query: row['query'] || '',
                    searchInterest: cleanNumber(row['search interest']),
                    increasePercent: String(row['increase percent'] || '').replace(/\u00a0/g, '').trim()
                }))
            } catch {
                result[term.key] = []
            }
        })
        res.json({ data: result })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

// /rising-queries
app.get('/rising-queries', (req, res) => {
    try {
        const result = {}
        TERMS.forEach(term => {
            try {
                const raw = loadCSV(`rising_queries_${term.file}.csv`)
                result[term.key] = raw.map(row => ({
                    query: row['query'] || '',
                    searchInterest: cleanNumber(row['search interest']),
                    increasePercent: String(row['increase percent'] || '').replace(/\u00a0/g, '').trim()
                }))
            } catch {
                result[term.key] = []
            }
        })
        res.json({ data: result })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(3001, () => console.log('Data Service läuft auf Port 3001'))