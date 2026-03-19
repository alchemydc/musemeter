import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(request: NextRequest) {
  try {
    if (!process.env.API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const searchParams = request.nextUrl.searchParams;
    const keyword = searchParams.get('keyword');

    if (!keyword) {
      return NextResponse.json(
        { error: 'Keyword parameter is required' },
        { status: 400 }
      );
    }

    const page = parseInt(searchParams.get('page') || '0') || 0;
    const size = parseInt(searchParams.get('size') || '') || Number(process.env.DEFAULT_EVENTS_PER_PAGE) || 20;

    const response = await axios.get('https://app.ticketmaster.com/discovery/v2/attractions.json', {
      params: {
        apikey: process.env.API_KEY,
        keyword,
        page,
        size
      }
    });

    if (!response.data) {
      throw new Error('Invalid API response: missing data');
    }

    return NextResponse.json(response.data);

  } catch (error: any) {
    console.error('API Error:', error.message);

    if (error.response?.status === 429) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Please try again later.', retryAfter: error.response.headers['retry-after'] || 30 },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch attractions' },
      { status: error.response?.status || 500 }
    );
  }
}
