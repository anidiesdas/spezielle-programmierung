import axios from "axios";

const DATA_SERVICE_URL = "http://localhost:3001";
const AI_SERVICE_URL = "http://localhost:8001";

export async function getMetrics(days) {
    const response = await axios.get(`${DATA_SERVICE_URL}/metrics`, {
        params: { days },
    });
    return response.data;
}

export async function getTopQueries(days) {
    const response = await axios.get(`${DATA_SERVICE_URL}/top-queries`, {
        params: { days },
    });
    return response.data;
}

export async function getRisingQueries(days) {
    const response = await axios.get(`${DATA_SERVICE_URL}/rising-queries`, {
        params: { days },
    });
    return response.data;
}

export async function getAiAnalysis(days) {
    const response = await axios.get(`${AI_SERVICE_URL}/analysis`, {
        params: { days },
    });
    return response.data;
}