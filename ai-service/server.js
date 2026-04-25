const express = require("express");
const cors = require("cors");

const app = express();
app.use(cors());

const DATA_SERVICE_URL = "http://data-service:3001/metrics";

app.get("/analysis", async (req, res) => {
    try {
        const response = await fetch(DATA_SERVICE_URL);
        const data = await response.json();

        const terms = data.terms || [];

        const strongestTerm = terms.reduce((max, term) =>
            term.mean > max.mean ? term : max
        );

        const highestPeak = terms.reduce((max, term) =>
            term.peak > max.peak ? term : max
        );

        const increasingTerms = terms
            .filter(term => term.trend === "increasing")
            .map(term => term.name);

        res.json({
            terms,
            analysis: {
                summary:
                    "Die Kategorie Supplements wurde anhand von Google-Trends-Daten für Deutschland analysiert.",
                strongest_average_interest:
                    `${strongestTerm.name} hat mit ${strongestTerm.mean} den höchsten durchschnittlichen Suchwert.`,
                highest_peak:
                    `${highestPeak.name} erreicht mit ${highestPeak.peak} den höchsten Peak.`,
                trend_observation:
                    increasingTerms.length > 0
                        ? `Einen steigenden Trend zeigen: ${increasingTerms.join(", ")}.`
                        : "Keiner der Begriffe zeigt einen steigenden Trend."
            }
        });

    } catch (error) {
        res.status(500).json({
            error: "AI Service konnte den Data Service nicht erreichen.",
            details: error.message
        });
    }
});

app.listen(8001, () => {
    console.log("AI Service läuft auf Port 8001");
});