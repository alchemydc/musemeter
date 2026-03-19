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
        { error: 'Event ID is required' },
        { status: 400 }
      );
    }

    if (!/^[a-zA-Z0-9-]+$/.test(id)) {
      return NextResponse.json(
        { error: 'Invalid event ID format' },
        { status: 400 }
      );
    }

    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events/${id}.json`,
      { params: { apikey: process.env.API_KEY } }
    );

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
        { error: 'Event not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      { error: error.message || 'Failed to fetch event details' },
      { status: error.response?.status || 500 }
    );
  }
}
