console.log("attraction details function triggered");
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

    const { id } = req.query;
    if (!id) {
      return res.status(400).json({ error: 'Attraction ID is required' });
    }

    debug('Request params:', { id });
    debug('Environment:', { 
      hasApiKey: !!process.env.API_KEY,
      nodeEnv: process.env.NODE_ENV
    });

    // Make request to Ticketmaster API
    const url = `https://app.ticketmaster.com/discovery/v2/attractions/${id}`;
    debug(`Calling Ticketmaster API: ${url}`);

    const response = await axios.get(url, {
      params: {
        apikey: process.env.API_KEY
      }
    });

    debug('Response status:', response.status);

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

    // Handle not found
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Attraction not found'
      });
    }

    return res.status(error.response?.status || 500).json({ 
      error: error.message || 'Failed to fetch attraction details'
    });
  }
};
