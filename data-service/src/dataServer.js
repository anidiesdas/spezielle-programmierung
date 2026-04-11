const express = require('express')
const cors = require('cors')
const fs = require('fs')
const { parse } = require('csv-parse/sync')
const path = require('path')

const app = express()
app.use(cors())
app.use(express.json())

function loadCSV(filename) {
    const filePath = path.join(__dirname, '../data', filename)
    const content = fs.readFileSync(filePath, 'utf-8')
    return parse(content, { columns: true, skip_empty_lines: true, trim: true })
}

function calcStats(data) {
    const terms = Object.keys(data[0]).filter(k =>
        k !== 'Woche' && k !== 'Tag' && k !== 'Datum' &&
        k !== 'date' && k !== 'Week' && k !== 'Time' && k !== 'time'
    )

    return terms.map(term => {
        const values = data.map(row => parseInt(row[term]) || 0)
        const mean = Math.round(values.reduce((a, b) => a + b, 0) / values.length)
        const peak = Math.max(...values)

        const half = Math.floor(values.length / 2)
        const firstHalf = Math.round(values.slice(0, half).reduce((a, b) => a + b, 0) / half)
        const secondHalf = Math.round(values.slice(half).reduce((a, b) => a + b, 0) / half)
        const trend = secondHalf > firstHalf + 5 ? 'steigend' : secondHalf < firstHalf - 5 ? 'fallend' : 'stabil'

        return { term, mean, peak, trend, firstHalf, secondHalf, values }
    })
}

app.get('/api/stats', (req, res) => {
    try {
        const data = loadCSV('interest_over_time.csv')
        const stats = calcStats(data)
        res.json({ stats })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.get('/api/top-queries', (req, res) => {
    try {
        const data = loadCSV('top_queries.csv')
        res.json({ data })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.get('/api/rising-queries', (req, res) => {
    try {
        const data = loadCSV('rising_queries.csv')
        res.json({ data })
    } catch (err) {
        res.status(500).json({ error: err.message })
    }
})

app.listen(3001, () => console.log('Data Service läuft auf Port 3001'))