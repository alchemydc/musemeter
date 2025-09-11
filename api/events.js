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

// Validate request parameters
const validateRequest = (req) => {
  if (!req.query.city && !req.query.keyword) {
    return {
      isValid: false,
      error: 'Either city or keyword parameter is required'
    };
  }
  return { isValid: true };
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

    // Validate request parameters
    const validation = validateRequest(req);
    if (!validation.isValid) {
      return res.status(400).json({ error: validation.error });
    }

    // Extract parameters from query
    const page = parseInt(req.query.page) || 0;
    const size = parseInt(req.query.size) || process.env.DEFAULT_EVENTS_PER_PAGE || 20;
    const { city, keyword } = req.query;

    debug('Request params:', { page, size, city, keyword });
    debug('Environment:', { 
      radius: RADIUS,
      radiusUnit: RADIUSUNIT,
      hasApiKey: !!process.env.API_KEY,
      nodeEnv: process.env.NODE_ENV
    });

    // Make request to Ticketmaster API with pagination
    const url = 'https://app.ticketmaster.com/discovery/v2/events.json';
    debug(`Calling Ticketmaster API: ${url}`);

    // Prepare API request parameters
    const params = {
      apikey: process.env.API_KEY,
      page: page,
      size: size,
      sort: 'date,asc'
    };

    // Add search parameters based on what was provided
    if (city) {
      params.city = city;
      params.radius = RADIUS;
      params.unit = RADIUSUNIT;
    } else if (keyword) {
      params.keyword = keyword;
    }

    const response = await axios.get(url, { params });

    debug('Response status:', response.status);
    debug('Response structure:', {
      hasData: !!response.data,
      hasEmbedded: !!response.data?._embedded,
      hasEvents: !!response.data?._embedded?.events,
      eventCount: response.data?._embedded?.events?.length || 0
    });

    // Initialize response structure
    const finalResponse = {
      page: response.data.page || { totalElements: 0, totalPages: 0, number: page, size },
      _links: response.data._links || {},
    };

    // Add events if they exist
    // Handle case where Ticketmaster API returns success but no events
    if (!response.data._embedded?.events) {
      debug('No events found in response');
      return res.status(404).json({
        error: keyword ? 
          'No events found for this artist/venue.' :
          'No events found in this location.',
        _embedded: { events: [] },
        page: { totalElements: 0, totalPages: 0, number: page, size }
      });
    }

    finalResponse._embedded = { events: response.data._embedded.events };
    return res.status(200).json(finalResponse);
    
  } catch (error) {
    console.error('API Error:', error.message);
    debug('Error details:', {
      message: error.message,
      status: error.response?.status,
      data: error.response?.data,
      config: {
        url: error.config?.url,
        params: error.config?.params
      },
      isAxiosError: error.isAxiosError,
      stack: error.stack
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
      error: error.message || 'Failed to fetch events'
    });
  }
};
