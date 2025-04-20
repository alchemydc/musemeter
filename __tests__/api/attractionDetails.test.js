import { describe, it, expect, beforeEach, afterEach, jest } from '@jest/globals';
import nock from 'nock';
import handler from '../../api/attractions/[id].js';

describe('GET /api/attractions/[id]', () => {
  const mockAttraction = {
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
  };

  beforeEach(() => {
    // Set required environment variables
    process.env.API_KEY = 'test-api-key';

    // Clean up any existing nock interceptors
    nock.cleanAll();

    // Mock the Ticketmaster API
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/attractions/1')
      .query(true)
      .reply(200, mockAttraction);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return attraction details', async () => {
    const req = {
      method: 'GET',
      query: { id: '1' }
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(200);
    expect(res.json).toHaveBeenCalledWith(mockAttraction);
  });

  it('should handle missing attraction ID', async () => {
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

    expect(res.status).toHaveBeenCalledWith(400);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Attraction ID is required'
    });
  });

  it('should handle Ticketmaster API errors', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/attractions/1')
      .query(true)
      .reply(500, { error: 'Internal Server Error' });

    const req = {
      method: 'GET',
      query: { id: '1' }
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

  it('should handle not found attractions', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/attractions/999')
      .query(true)
      .reply(404, { error: 'Not Found' });

    const req = {
      method: 'GET',
      query: { id: '999' }
    };

    const res = {
      setHeader: jest.fn(),
      status: jest.fn().mockReturnThis(),
      json: jest.fn()
    };

    await handler(req, res);

    expect(res.status).toHaveBeenCalledWith(404);
    expect(res.json).toHaveBeenCalledWith({
      error: 'Attraction not found'
    });
  });
});
