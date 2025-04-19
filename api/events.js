console.log("events.js function triggered");
import axios from 'axios';

// Debug logger utility
const debug = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Debug]', ...args);
  }
};

// Default values
const RADIUS = process.env.RADIUS || '50';
const RADIUSUNIT = process.env.RADIUS_UNIT || 'miles';

// Validate required environment variables
const validateEnv = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY environment variable is not set');
  }
};

export default async (req, res) => {
  try {
    // Enable CORS
    res.setHeader('Access-Control-Allow-Credentials', true);
    res.setHeader('Access-Control-Allow-Origin', '*');
    
    // Handle preflight request
    if (req.method === 'OPTIONS') {
      res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS');
      res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
      return res.status(200).json({ message: 'OK' });
    }

    // Validate environment variables
    validateEnv();

    // Extract pagination parameters and city from query
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || process.env.DEFAULT_EVENTS_PER_PAGE || 20;
    const city = req.query.city;

    debug('Request params:', { page, size, city });
    debug('Environment:', { 
      radius: RADIUS,
      radiusUnit: RADIUSUNIT,
      hasApiKey: !!process.env.API_KEY,
      nodeEnv: process.env.NODE_ENV
    });

    // Make request to Ticketmaster API with pagination
    const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
    debug(`Calling Ticketmaster API: ${url}`);

    const response = await axios.get(url, {
      params: {
        apikey: process.env.API_KEY,
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

    // Return the response data
    return res.status(200).json(response.data);
    
  } catch (error) {
    console.error('API Error:', error.message);
    debug('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        params: error.config?.params
      }
    });

    // Handle rate limiting specifically
    if (error.response?.status === 429) {
      return res.status(429).json({
        error: 'Rate limit exceeded. Please try again later.',
        retryAfter: error.response.headers['retry-after'] || 30
      });
    }

    // Handle missing API key
    if (error.message === 'API_KEY environment variable is not set') {
      return res.status(500).json({
        error: 'Server configuration error. Please contact support.'
      });
    }

    return res.status(error.response?.status || 500).json({ 
      error: 'Failed to fetch events',
      message: error.message
    });
  }
};
