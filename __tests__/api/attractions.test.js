import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import nock from 'nock';
import { GET } from '../../app/api/attractions/route.ts';
import { NextRequest } from 'next/server';

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
    process.env.API_KEY = 'test-api-key';
    process.env.DEFAULT_EVENTS_PER_PAGE = '2';
    nock.cleanAll();

    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/attractions.json')
      .query(true)
      .reply(200, mockAttractions);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return a list of attractions for a keyword search', async () => {
    const request = new NextRequest('http://localhost:3000/api/attractions?keyword=Taylor+Swift');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockAttractions);
  });

  it('should handle missing keyword parameter', async () => {
    const request = new NextRequest('http://localhost:3000/api/attractions');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual(expect.objectContaining({
      error: 'Keyword parameter is required'
    }));
  });

  it('should handle Ticketmaster API errors', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/attractions.json')
      .query(true)
      .reply(500, { error: 'Internal Server Error' });

    const request = new NextRequest('http://localhost:3000/api/attractions?keyword=Taylor+Swift');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual(expect.objectContaining({
      error: expect.any(String)
    }));
  });

  it('should handle rate limiting from Ticketmaster API', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/attractions.json')
      .query(true)
      .reply(429, { error: 'Rate limit exceeded' });

    const request = new NextRequest('http://localhost:3000/api/attractions?keyword=Taylor+Swift');
    const response = await GET(request);
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data).toEqual(expect.objectContaining({
      error: expect.stringContaining('Rate limit exceeded')
    }));
  });
});
