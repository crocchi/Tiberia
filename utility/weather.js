//https://www.campaniameteo.com/graficistazioni/capri/data.json
// dati meteo stazione di capri

[{
    "ora": "20:55",
    "temp": "11.0", "dewpoint":
        "5.0", "pressure": "1010.0",
    "winddeg": "0", "ktssp": "2.0", "ktsmax": "2.0", "relhum": "66"
}]

// Example of how to parse and use the data in JavaScript
const weatherData = [{
    "ora": "20:55",
    "temp": "11.0",
    "dewpoint": "5.0",
    "pressure": "1010.0",
    "winddeg": "0",
    "ktssp": "2.0",
    "ktsmax": "2.0",
    "relhum": "66"
}];

// Accessing the weather data
weatherData.forEach(entry => {
    console.log(`Time: ${entry.ora}`);
    console.log(`Temperature: ${entry.temp} °C`);
    console.log(`Dewpoint: ${entry.dewpoint} °C`);
    console.log(`Pressure: ${entry.pressure} hPa`);
    console.log(`Wind Direction: ${entry.winddeg}°`);
    console.log(`Wind Speed (Sustained): ${entry.ktssp} kts`);
    console.log(`Wind Speed (Max): ${entry.ktsmax} kts`);
    console.log(`Relative Humidity: ${entry.relhum}%`);
});