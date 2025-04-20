console.log("attractions.js function triggered");
import axios from 'axios';

// Debug logger utility
const debug = (...args) => {
  if (process.env.NODE_ENV === 'development') {
    console.log('[Debug]', ...args);
  }
};

// Validate required environment variables
const validateEnv = () => {
  if (!process.env.API_KEY) {
    throw new Error('API_KEY environment variable is not set');
  }
};

// Validate request parameters
const validateRequest = (req) => {
  if (!req.query.keyword) {
    return {
      isValid: false,
      error: 'Keyword parameter is required'
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
    const keyword = req.query.keyword;

    debug('Request params:', { page, size, keyword });
    debug('Environment:', { 
      hasApiKey: !!process.env.API_KEY,
      nodeEnv: process.env.NODE_ENV
    });

    // Make request to Ticketmaster API
    const url = 'https://app.ticketmaster.com/discovery/v2/attractions.json';
    debug(`Calling Ticketmaster API: ${url}`);

    const response = await axios.get(url, {
      params: {
        apikey: process.env.API_KEY,
        keyword: keyword,
        page: page,
        size: size
      }
    });

    debug('Response status:', response.status);
    debug('Response structure:', {
      hasData: !!response.data,
      hasEmbedded: !!response.data?._embedded,
      hasAttractions: !!response.data?._embedded?.attractions,
      attractionCount: response.data?._embedded?.attractions?.length || 0
    });

    // Validate response data
    if (!response.data) {
      debug('Invalid response:', response.data);
      throw new Error('Invalid API response: missing data');
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
      error: error.message || 'Failed to fetch attractions'
    });
  }
};
