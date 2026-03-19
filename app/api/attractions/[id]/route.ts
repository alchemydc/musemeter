import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    if (!process.env.API_KEY) {
      return NextResponse.json(
        { error: 'Server configuration error. Please contact support.' },
        { status: 500 }
      );
    }

    const { id } = await params;

    if (!id) {
      return NextResponse.json(
        { error: 'Attraction ID is required' },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/attractions/${id}`,
      { params: { apikey: process.env.API_KEY } }
    );

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

    if (error.response?.status === 404) {
      return NextResponse.json(
        { error: 'Attraction not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch attraction details' },
      { status: error.response?.status || 500 }
    );
  }
}
