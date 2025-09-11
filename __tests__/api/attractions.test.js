import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import nock from 'nock';
import handler from '../../api/attractions.js';

describe('GET /api/attractions', () => {
  const mockAttractions = {
    _embedded: {
      attractions: [
        {
          id: '1',
          name: 'Taylor Swift',
          type: 'artist',
          classifications: [
            {
              primary: true,
              segment: {
                id: 'KZFzniwnSyZfZ7v7nJ',
                name: 'Music'
              }
            }
          ],
          url: 'http://example.com/taylor-swift',
          images: [
            {
              url: 'http://example.com/taylor-swift.jpg',
              ratio: '16_9',
              width: 1024,
              height: 576
            }
          ]
        },
        {
          id: '2',
          name: 'Taylor Swift Experience',
          type: 'attraction',
          url: 'http://example.com/taylor-swift-experience'
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
      .get('/discovery/v2/attractions.json')
      .query(true)
      .reply(200, mockAttractions);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return a list of attractions for a keyword search', async () => {
    const req = {
      method: 'GET',
      query: { keyword: 'Taylor Swift' }
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAttractions);
  });

  it('should handle missing keyword parameter', async () => {
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
      error: 'Keyword parameter is required'
    }));
  });

  it('should handle Ticketmaster API errors', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/attractions.json')
      .query(true)
      .reply(500, { error: 'Internal Server Error' });

    const req = {
      method: 'GET',
      query: { keyword: 'Taylor Swift' }
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
      .get('/discovery/v2/attractions.json')
      .query(true)
      .reply(429, { error: 'Rate limit exceeded' });

    const req = {
      method: 'GET',
      query: { keyword: 'Taylor Swift' }
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
