// to test this code, run the following command:
// curl "http://localhost:3000/api/events?page=0&size=20"

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());

const API_KEY = process.env.API_KEY;
// const CITY = process.env.CITY;
const RADIUS = process.env.RADIUS || '50';
const RADIUSUNIT = process.env.RADIUS_UNIT || 'miles'; // or 'km'
// log the radius to console
console.log(`Radius: ${RADIUS}`);

app.get('/api/events', async (req, res) => {
  try {
    // Extract pagination parameters and city and state from query
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || 20;
    const city = req.query.city;
    const state = req.query.state;

    // Make request to Ticketmaster API with pagination
    // ref: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/#overview
    const response = await axios.get(
      'https://app.ticketmaster.com/discovery/v2/events.json',
      {
        params: {
          apikey: API_KEY,
          city: city,
          stateCode: state,
          radius: RADIUS,
          unit: RADIUSUNIT,
          page: page,
          size: size,
          sort: 'date,asc' // Optional: sort by date ascending
        }
      }
    );

    // Validate response data
    if (!response.data.page) {
      throw new Error('Invalid API response: missing pagination data');
    }

    res.json(response.data);
  } catch (error) {
    console.error('API Error:', error.message);
    
    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: error.response.headers['retry-after'] || 30
      });
    }

    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.listen(port, () => {
  const message = `
=================================
🎵 MuseMeter Server Ready!
📍 Local:    http://localhost:${port}
🔑 API Path: /api/events
=================================
`;
  console.log(message);
});
