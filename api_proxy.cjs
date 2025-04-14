/* 
# to test these endpoints:
# List events for a particular city and state
curl "http://localhost:3000/api/events?city=Denver&state=CO"

# Get details for a specific event
curl "http://localhost:3000/api/events/EVENT_ID"
*/

const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = process.env.API_PROXY_PORT || 3000;
const isDev = process.env.NODE_ENV === 'development';

// Debug logger utility
const debug = (...args) => {
  if (isDev) {
    console.log('[Debug]', ...args);
  }
};

app.use(cors());

const API_KEY = process.env.API_KEY;
const RADIUS = process.env.RADIUS || '50';
const RADIUSUNIT = process.env.RADIUS_UNIT || 'miles'; // or 'km'
// log the radius to console
debug(`Search Radius: ${RADIUS}`);

app.get('/api/events', async (req, res) => {
  try {
    // Extract pagination parameters and city from query
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || process.env.DEFAULT_EVENTS_PER_PAGE || 20;
    const city = req.query.city;

    debug('Request params:', { page, size, city });

    // Make request to Ticketmaster API with pagination
    const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
    debug(`Calling Ticketmaster API: ${url}`);

    const response = await axios.get(url, {
      params: {
        apikey: API_KEY,
        city: city,
        radius: RADIUS,
        unit: RADIUSUNIT,
        page: page,
        size: size,
        sort: 'date,asc'
      }
    });

    debug('Response status:', response.status);
    debug('Response structure:', {
      hasData: !!response.data,
      hasEmbedded: !!response.data?._embedded,
      hasEvents: !!response.data?._embedded?.events,
      eventCount: response.data?._embedded?.events?.length || 0
    });

    // Validate response data
    if (!response.data || !response.data._embedded || !response.data._embedded.events) {
      debug('Invalid response:', response.data);
      throw new Error('Invalid API response: missing events data');
    }

    // Just send the response data directly
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

app.get('/api/events/:id', async (req, res) => {
  try {
    const { id } = req.params;
    debug(`Fetching event details for ID: ${id}`);

    const url = `https://app.ticketmaster.com/discovery/v2/events/${id}.json`;
    debug(`Calling Ticketmaster API: ${url}`);

    const response = await axios.get(url, {
      params: {
        apikey: API_KEY
      }
    });
    
    debug(`Ticketmaster API response status: ${response.status}`);
    
    // Add response data validation
    if (!response.data) {
      throw new Error('Invalid API response: missing data');
    }

    // Add debug logging for response data
    // debug('Event data:', response.data);

    res.json(response.data);
  } catch (error) {
    debug('API Error:', {
      message: error.message,
      status: error.response?.status,
      url: error.config?.url
    });

    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: error.response.headers['retry-after'] || 30
      });
    }

    // Always send an error response
    return res.status(error.response?.status || 500).json({ 
      error: error.message || 'Failed to fetch event details' 
    });
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
