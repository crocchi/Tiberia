import fetch from 'node-fetch';
import { WEATHER_API_KEY, INDEX_DB_WEATHER } from '../.devcontainer/config.js';
import { processAndSaveToPinecone } from '../DB/pineconeDB.js';


// Cache in memoria: location -> { timestamp, data }
const weatherCache = new Map();
const CACHE_DURATION_MS = 6 * 60 * 60 * 1000; // 6 ore


/**
 * Ottiene il meteo attuale e il forecast dei prossimi 3 giorni per una località.
 * @param {string} location - Es: "Capri, Italy"
 * @returns {Promise<Object|null>} - Oggetto con meteo attuale e forecast, oppure null in caso di errore.
 */
export async function getWeather(location = "Capri, Italy") {
    if (!WEATHER_API_KEY) {
        console.error("WEATHER_API_KEY non impostata.");
        return null;
    }
    // 1. Prova la cache in memoria
    const cache = weatherCache.get(location);
    if (cache && (Date.now() - cache.timestamp) < CACHE_DURATION_MS) {
        return formatWeatherMessage(cache.data);
    }

    // 2. Fetch live dal servizio esterno
    const url = `https://api.weatherapi.com/v1/forecast.json?key=${WEATHER_API_KEY}&q=${encodeURIComponent(location)}&days=4&lang=it`;

    try {
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Errore HTTP: ${response.status}`);
        const data = await response.json();

        // Estrai meteo attuale
        const current = {
            location: data.location.name,
            region: data.location.region,
            country: data.location.country,
            date: data.current.last_updated,
            condition: data.current.condition.text,
            temp_c: data.current.temp_c,
            wind_kph: data.current.wind_kph,
            humidity: data.current.humidity,
            icon: data.current.condition.icon
        };

        // Estrai forecast dei prossimi 3 giorni
        const forecast = data.forecast.forecastday.slice(1, 4).map(day => ({
            date: day.date,
            condition: day.day.condition.text,
            min_temp_c: day.day.mintemp_c,
            max_temp_c: day.day.maxtemp_c,
            rain_mm: day.day.totalprecip_mm,
            wind_kph: day.day.maxwind_kph,
            icon: day.day.condition.icon
        }));

        const result = { current, forecast };
        weatherCache.set(location, { timestamp: Date.now(), data: result });

        //// Prepara l'array (anche con un solo elemento)
        const items = [{
            title: `Meteo: ${current.location} ${current.date}`,
            snippet: formatWeatherMessage(result),
            pubDate: current.date,
            link: `${current.location}-${current.date}` // ID unico
        }];

        // Estrattore di testo per embedding
        const weatherTextExtractor = item => `${item.title}. ${item.snippet}`;

        // Salva nel db Pinecone (es: 'weather-capri')
        await processAndSaveToPinecone(items, weatherTextExtractor, INDEX_DB_WEATHER);

        return formatWeatherMessage(result);

    } catch (error) {
        console.error("Errore durante il fetch del meteo:", error);
        return null;
    }
}

function formatWeatherMessage({ current, forecast }) {
    let msg = `Meteo attuale per ${current.location} (${current.region}, ${current.country}) il ${current.date}:\n`;
    msg += `- Condizioni: ${current.condition}\n`;
    msg += `- Temperatura: ${current.temp_c}°C\n`;
    msg += `- Vento: ${current.wind_kph} km/h\n`;
    msg += `- Umidità: ${current.humidity}%\n`;

    msg += `\nPrevisioni per i prossimi 3 giorni:\n`;
    forecast.forEach(day => {
        msg += `• ${day.date}: ${day.condition}, min ${day.min_temp_c}°C, max ${day.max_temp_c}°C, pioggia ${day.rain_mm}mm, vento ${day.wind_kph} km/h\n`;
    });

    return msg;
}

/*
async function saveWeatherToVectorDB(weatherObj, indexName = INDEX_DB_WEATHER) {
    const text = formatWeatherMessage(weatherObj); // oppure crea una stringa più sintetica
    const embedding = await generateEmbedding(text);
    const index = await getPineconeIndex(indexName);

    await index.upsert([{
        id: `${weatherObj.current.location}-${weatherObj.current.date}`,
        values: embedding,
        metadata: {
            ...weatherObj.current,
            forecast: weatherObj.forecast
        }
    }]);
}*/