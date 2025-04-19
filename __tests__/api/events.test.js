import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import nock from 'nock';
import handler from '../../api/events.js';

describe('GET /api/events', () => {
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

  beforeEach(() => {
    // Set required environment variables
    process.env.API_KEY = 'test-api-key';
    process.env.DEFAULT_EVENTS_PER_PAGE = '2';

    // Clean up any existing nock interceptors
    nock.cleanAll();

    // Mock the Ticketmaster API
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/events.json')
      .query(true)
      .reply(200, mockEvents);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return a list of events for Denver', async () => {
    const req = {
      method: 'GET',
      query: { city: 'Denver' }
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockEvents);
  });

  it('should handle missing city parameter', async () => {
    const req = {
      method: 'GET',
      query: {}
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handler(req, res);

    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
    }));
  });

  it('should handle Ticketmaster API errors', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/events.json')
      .query(true)
      .reply(500, { error: 'Internal Server Error' });

    const req = {
      method: 'GET',
      query: { city: 'Denver' }
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
    }));
  });

  it('should handle rate limiting from Ticketmaster API', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/events.json')
      .query(true)
      .reply(429, { error: 'Rate limit exceeded' });

    const req = {
      method: 'GET',
      query: { city: 'Denver' }
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(429);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.stringContaining('Rate limit exceeded')
    }));
  });
});
