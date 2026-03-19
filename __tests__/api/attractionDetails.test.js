import { describe, it, expect, beforeEach, afterEach } from '@jest/globals';
import nock from 'nock';
import { GET } from '../../app/api/attractions/[id]/route.ts';
import { NextRequest } from 'next/server';

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
    process.env.API_KEY = 'test-api-key';
    nock.cleanAll();

    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/attractions/1')
      .query(true)
      .reply(200, mockAttraction);
  });

  afterEach(() => {
    nock.cleanAll();
  });

  it('should return attraction details', async () => {
    const request = new NextRequest('http://localhost:3000/api/attractions/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(200);
    expect(data).toEqual(mockAttraction);
  });

  it('should handle missing attraction ID', async () => {
    const request = new NextRequest('http://localhost:3000/api/attractions/');
    const response = await GET(request, { params: Promise.resolve({ id: '' }) });
    const data = await response.json();

    expect(response.status).toBe(400);
    expect(data).toEqual({
      error: 'Attraction ID is required'
    });
  });

  it('should handle Ticketmaster API errors', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/attractions/1')
      .query(true)
      .reply(500, { error: 'Internal Server Error' });

    const request = new NextRequest('http://localhost:3000/api/attractions/1');
    const response = await GET(request, { params: Promise.resolve({ id: '1' }) });
    const data = await response.json();

    expect(response.status).toBe(500);
    expect(data).toEqual(expect.objectContaining({
      error: expect.any(String)
    }));
  });

  it('should handle not found attractions', async () => {
    nock.cleanAll();
    nock('https://app.ticketmaster.com')
      .get('/discovery/v2/attractions/999')
      .query(true)
      .reply(404, { error: 'Not Found' });

    const request = new NextRequest('http://localhost:3000/api/attractions/999');
    const response = await GET(request, { params: Promise.resolve({ id: '999' }) });
    const data = await response.json();

    expect(response.status).toBe(404);
    expect(data).toEqual({
      error: 'Attraction not found'
    });
  });
});
