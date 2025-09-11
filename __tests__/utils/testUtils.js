import nock from 'nock';

// Base URL for API requests in tests
const TEST_API_URL = `http://localhost:${process.env.VERCEL_DEV_PORT}`;

// Base URL for Ticketmaster API
const TICKETMASTER_API_URL = 'https://app.ticketmaster.com';

// Common mock data
const mockEvents = {
  _embedded: {
    events: [
      {
        id: '1',
        name: 'Concert A',
        url: 'http://example.com/a',
        dates: {
          start: {
            localDate: '2025-05-01',
            localTime: '19:00:00'
          }
        },
        _embedded: {
          venues: [{
            name: 'Venue A',
            city: { name: 'Denver' },
            state: { stateCode: 'CO' }
          }]
        }
      },
      {
        id: '2',
        name: 'Concert B',
        url: 'http://example.com/b',
        dates: {
          start: {
            localDate: '2025-05-02',
            localTime: '20:00:00'
          }
        },
        _embedded: {
          venues: [{
            name: 'Venue B',
            city: { name: 'Denver' },
            state: { stateCode: 'CO' }
          }]
        }
      }
    ]
  },
  page: {
    size: 20,
    totalElements: 2,
    totalPages: 1,
    number: 0
  }
};

const mockEventDetails = {
  id: '1',
  name: 'Concert A',
  description: 'A great concert!',
  url: 'http://example.com/event/1',
  dates: {
    start: {
      localDate: '2025-05-01',
      localTime: '19:00:00'
    }
  },
  priceRanges: [
    {
      type: 'standard',
      min: 45.0,
      max: 125.0,
      currency: 'USD'
    }
  ],
  _embedded: {
    venues: [{
      name: 'Venue A',
      city: { name: 'Denver' },
      state: { stateCode: 'CO' },
      address: {
        line1: '123 Main St'
      }
    }],
    attractions: [{
      name: 'Artist A',
      url: 'http://example.com/artist/1'
    }]
  }
};

// Helper functions for common test operations
const mockTicketmasterEvents = (city = 'Denver') => {
  nock(TICKETMASTER_API_URL)
    .get('/discovery/v2/events.json')
    .query(true)
    .reply(200, mockEvents);
};

const mockTicketmasterEventDetails = (eventId = '1') => {
  nock(TICKETMASTER_API_URL)
    .get(`/discovery/v2/events/${eventId}.json`)
    .query(true)
    .reply(200, mockEventDetails);
};

const mockTicketmasterError = (statusCode, endpoint = '/discovery/v2/events.json') => {
  nock(TICKETMASTER_API_URL)
    .get(endpoint)
    .query(true)
    .reply(statusCode, { error: getErrorMessage(statusCode) });
};

const getErrorMessage = (statusCode) => {
  switch (statusCode) {
    case 404:
      return 'Not Found';
    case 429:
      return 'Rate limit exceeded';
    case 500:
      return 'Internal Server Error';
    default:
      return 'Unknown error';
  }
};

export {
  TEST_API_URL,
  TICKETMASTER_API_URL,
  mockEvents,
  mockEventDetails,
  mockTicketmasterEvents,
  mockTicketmasterEventDetails,
  mockTicketmasterError,
};
