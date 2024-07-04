const express = require("express");
const requestIp = require('request-ip');
const axios = require('axios');
require('dotenv').config();


const app = express();
const port = process.env.PORT || 3000;
const api_key = process.env.OPENWEATHERMAP_API_KEY;

// Configure middleware to get client IP from headers
app.use(requestIp.mw());


app.get('/api/hello', async (req, res) => {
    const visitorName = req.query.visitor_name || 'Visitor';

    try {
        // Get client's real IP address from headers
        const clientIp = req.clientIp;
        console.log(`Client IP: ${clientIp}`);

        // Fetch location data using ip-api.com or similar service
        const locationResponse = await axios.get(`http://ip-api.com/json/${clientIp}`);
        console.log(locationResponse.data); // Log location data for debugging

        const { city, lat, lon } = locationResponse.data;

        if (!city || !lat || !lon) {
            throw new Error('Location data not available');
        }

        // Fetch weather data from OpenWeatherMap API using the latitude and longitude
        const weatherResponse = await axios.get(`http://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${api_key}`);
        const temperature = weatherResponse.data.main.temp;

        res.json({
            client_ip: clientIp,
            location: city,
            greeting: `Hello, ${visitorName}! The temperature is ${temperature} degrees Celsius in ${city}.`
        });
    } catch (error) {
        console.error(error.message);
        res.status(500).json({ error: 'Unable to fetch location or weather data' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});

module.exports = app;