import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import nock from 'nock';
import handler from '../../api/events/[id].js';

describe('GET /api/events/:id', () => {
  const mockEventId = '1';
  const mockEventDetails = {
    id: mockEventId,
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

  beforeEach(() => {
    // Set required environment variables
    process.env.API_KEY = 'test-api-key';

    // Clean up any existing nock interceptors
    nock.cleanAll();

    // Mock the Ticketmaster API
    nock('https://app.ticketmaster.com')
      .get(`/discovery/v2/events/${mockEventId}.json`)
      .query(true)
      .reply(200, mockEventDetails);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return details for a specific event', async () => {
    const req = {
      method: 'GET',
      query: { id: mockEventId }
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockEventDetails);
  });

  it('should handle non-existent event ID', async () => {
    const nonExistentId = '999';
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get(`/discovery/v2/events/${nonExistentId}.json`)
      .query(true)
      .reply(404, { error: 'Not Found' });

    const req = {
      method: 'GET',
      query: { id: nonExistentId }
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
    }));
  });

  it('should handle Ticketmaster API errors', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get(`/discovery/v2/events/${mockEventId}.json`)
      .query(true)
      .reply(500, { error: 'Internal Server Error' });

    const req = {
      method: 'GET',
      query: { id: mockEventId }
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
      .get(`/discovery/v2/events/${mockEventId}.json`)
      .query(true)
      .reply(429, { error: 'Rate limit exceeded' });

    const req = {
      method: 'GET',
      query: { id: mockEventId }
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

  it('should handle invalid event ID format', async () => {
    const invalidId = 'invalid-id@#$';
    const req = {
      method: 'GET',
      query: { id: invalidId }
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith(expect.objectContaining({
      error: expect.any(String)
    }));
  });
});
