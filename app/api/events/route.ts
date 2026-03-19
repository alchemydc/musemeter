import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

const RADIUS = process.env.RADIUS || '50';
const RADIUSUNIT = process.env.RADIUS_UNIT || 'miles';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const city = searchParams.get('city');
    const keyword = searchParams.get('keyword');

    if (!city && !keyword) {
      return NextResponse.json(
        { error: 'Either city or keyword parameter is required' },
        { status: 400 }
      );
    }

    const page = parseInt(searchParams.get('page') || '0') || 0;
    const size = parseInt(searchParams.get('size') || '') || Number(process.env.DEFAULT_EVENTS_PER_PAGE) || 20;

    const params: Record<string, string | number> = {
      apikey: process.env.API_KEY,
      page,
      size,
      sort: 'date,asc'
    };

    if (city) {
      params.city = city;
      params.radius = RADIUS;
      params.unit = RADIUSUNIT;
    } else if (keyword) {
      params.keyword = keyword;
    }

    const response = await axios.get('https://app.ticketmaster.com/discovery/v2/events.json', { params });

    if (!response.data._embedded?.events) {
      return NextResponse.json({
        error: keyword
          ? 'No events found for this artist/venue.'
          : 'No events found in this location.',
        _embedded: { events: [] },
        page: { totalElements: 0, totalPages: 0, number: page, size }
      }, { status: 404 });
    }

    const finalResponse = {
      page: response.data.page || { totalElements: 0, totalPages: 0, number: page, size },
      _links: response.data._links || {},
      _embedded: { events: response.data._embedded.events }
    };

    return NextResponse.json(finalResponse);

  } catch (error: any) {
    console.error('API Error:', error.message);

    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.', retryAfter: error.response.headers['retry-after'] || 30 },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch events' },
      { status: error.response?.status || 500 }
    );
  }
}
