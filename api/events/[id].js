console.log("events[id].js serverless function triggered");
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
  if (!req.query.id) {
    return {
      isValid: false,
      error: 'Event ID is required'
    };
  }
  
  // Check for valid event ID format (alphanumeric and hyphens only)
  if (!/^[a-zA-Z0-9-]+$/.test(req.query.id)) {
    return {
      isValid: false,
      error: 'Invalid event ID format'
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

    // Extract event ID from query
    const eventId = req.query.id;

    // Make request to Ticketmaster API
    const url = `https://app.ticketmaster.com/discovery/v2/events/${eventId}.json`;
    debug(`Calling Ticketmaster API: ${url}`);

    const response = await axios.get(url, {
      params: {
        apikey: process.env.API_KEY
      }
    });

    debug('Response status:', response.status);
    debug('Response data:', response.data);

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

    // Handle not found errors
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    return res.status(error.response?.status || 500).json({ 
      error: error.message || 'Failed to fetch event details'
    });
  }
};
