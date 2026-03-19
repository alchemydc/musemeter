import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import nock from 'nock';
import { GET } from '../../app/api/events/[id]/route.ts';
import { NextRequest } from 'next/server';

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
    process.env.API_KEY = 'test-api-key';
    nock.cleanAll();

    nock('https://app.ticketmaster.com')
      .get(`/discovery/v2/events/${mockEventId}.json`)
      .query(true)
      .reply(200, mockEventDetails);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return details for a specific event', async () => {
    const request = new NextRequest(`http://localhost:3000/api/events/${mockEventId}`);
    const response = await GET(request, { params: Promise.resolve({ id: mockEventId }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockEventDetails);
  });

  it('should handle non-existent event ID', async () => {
    const nonExistentId = '999';
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get(`/discovery/v2/events/${nonExistentId}.json`)
      .query(true)
      .reply(404, { error: 'Not Found' });

    const request = new NextRequest(`http://localhost:3000/api/events/${nonExistentId}`);
    const response = await GET(request, { params: Promise.resolve({ id: nonExistentId }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual(expect.objectContaining({
      error: expect.any(String)
    }));
  });

  it('should handle Ticketmaster API errors', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get(`/discovery/v2/events/${mockEventId}.json`)
      .query(true)
      .reply(500, { error: 'Internal Server Error' });

    const request = new NextRequest(`http://localhost:3000/api/events/${mockEventId}`);
    const response = await GET(request, { params: Promise.resolve({ id: mockEventId }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual(expect.objectContaining({
      error: expect.any(String)
    }));
  });

  it('should handle rate limiting from Ticketmaster API', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get(`/discovery/v2/events/${mockEventId}.json`)
      .query(true)
      .reply(429, { error: 'Rate limit exceeded' });

    const request = new NextRequest(`http://localhost:3000/api/events/${mockEventId}`);
    const response = await GET(request, { params: Promise.resolve({ id: mockEventId }) });
    const data = await response.json();

    expect(response.status).toBe(429);
    expect(data).toEqual(expect.objectContaining({
      error: expect.stringContaining('Rate limit exceeded')
    }));
  });

  it('should handle invalid event ID format', async () => {
    const invalidId = 'invalid-id@#$';
    const request = new NextRequest(`http://localhost:3000/api/events/${invalidId}`);
    const response = await GET(request, { params: Promise.resolve({ id: invalidId }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual(expect.objectContaining({
      error: expect.any(String)
    }));
  });
});
