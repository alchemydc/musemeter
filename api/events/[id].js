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
    debug(`Fetching event details for ID: ${id}`);

    const url = `https://app.ticketmaster.com/discovery/v2/events/${id}.json`;
    debug(`Calling Ticketmaster API: ${url}`);
    debug('Environment:', { 
      hasApiKey: !!process.env.API_KEY,
      nodeEnv: process.env.NODE_ENV
    });

    const response = await axios.get(url, {
      params: {
        apikey: process.env.API_KEY
      }
    });
    
    debug(`Ticketmaster API response status: ${response.status}`);
    debug('Response structure:', {
      hasData: !!response.data,
      eventName: response.data?.name,
      hasVenues: !!response.data?._embedded?.venues,
      hasAttractions: !!response.data?._embedded?.attractions
    });
    
    // Add response data validation
    if (!response.data) {
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

    // Handle event not found
    if (error.response?.status === 404) {
      return res.status(404).json({
        error: 'Event not found'
      });
    }

    // Return an error response
    return res.status(error.response?.status || 500).json({ 
      error: error.message || 'Failed to fetch event details' 
    });
  }
};
