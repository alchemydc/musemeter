'use client';

import React, { useState, useEffect } from 'react';
import axios from 'axios';
import ClassificationIcon from './ClassificationIcon';
import { debug } from '../utils/debug';
import { buildLocalEventDate, formatDisplayDate, formatDisplayTime } from '../utils/date';

interface EventDetailsProps {
  eventId: string;
}

interface EventDetailsData {
  name: string;
  description?: string;
  dates: {
    start: {
      localDate: string;
      localTime: string;
    };
  };
  _embedded?: {
    venues?: {
      name: string;
      city: {
        name: string;
      };
      state: {
        name: string;
      };
    }[];
    attractions?: Attraction[];
  };
  classifications?: {
    segment?: {
      name: string;
    };
    genre?: {
      name: string;
    };
    subGenre?: {
      name: string;
    };
  }[];
  attractions?: Attraction[];
}

interface AttractionLink {
  url: string;
}

interface AttractionLinks {
  youtube?: AttractionLink[];
  spotify?: AttractionLink[];
  homepage?: AttractionLink[];
}

interface Attraction {
  name: string;
  url: string;
  externalLinks?: AttractionLinks;
}

const createGoogleCalendarUrl = (event: EventDetailsData) => {
  if (!event.dates.start.localDate) return '';

  // Build a Date in the local timezone using components to avoid UTC parsing issues
  const startDate = buildLocalEventDate(event.dates.start.localDate, event.dates.start.localTime);
  const endDate = new Date(startDate);
  endDate.setHours(startDate.getHours() + 3); // Default to 3 hour duration

  const venue = event._embedded?.venues?.[0];
  const location = venue ? `${venue.name}, ${venue.city.name}, ${venue.state.name}` : '';

  const params = new URLSearchParams({
    action: 'TEMPLATE',
    text: event.name,
    dates: `${startDate.toISOString().replace(/[-:]/g, '').replace('.000', '')}/` +
           `${endDate.toISOString().replace(/[-:]/g, '').replace('.000', '')}`,
    details: event.description || '',
    location: location
  });

  return `https://www.google.com/calendar/render?${params.toString()}`;
};

const EventDetails: React.FC<EventDetailsProps> = ({ eventId }) => {
  const [eventDetails, setEventDetails] = useState<EventDetailsData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const response = await axios.get(`/api/events/${eventId}`);

        const attractionsData = response.data._embedded?.attractions?.map((a: Attraction) => ({
          name: a.name,
          url: a.url,
          youtubeLinks: a.externalLinks?.youtube?.map((y: AttractionLink) => y.url),
          spotifyLinks: a.externalLinks?.spotify?.map((s: AttractionLink) => s.url),
          homepageLinks: a.externalLinks?.homepage?.map((h: AttractionLink) => h.url)
        }));

        debug('Event details:', {
          id: eventId,
          name: response.data.name,
          hasAttractions: !!response.data._embedded?.attractions,
          attractions: attractionsData
        });

        setEventDetails(response.data);
      } catch (error) {
        setError(error instanceof Error ? error.message : 'Failed to fetch event details');
        console.error('Failed to fetch event details:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  if (isLoading) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="animate-pulse flex space-x-4">
          <div className="flex-1 space-y-4 py-1">
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
            <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
        <div className="text-red-600 dark:text-red-400">{error}</div>
      </div>
    );
  }

  if (!eventDetails) {
    return null;
  }

  return (
    <div className="bg-white dark:bg-gray-800 shadow rounded-lg p-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {eventDetails?.classifications?.[0]?.segment?.name && (
            <ClassificationIcon
              segmentName={eventDetails.classifications[0].segment.name}
              className="h-6 w-6 text-gray-400 dark:text-gray-500"
            />
          )}
          <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
            {eventDetails?.name}
          </h2>
        </div>
      </div>

      <div className="flex flex-col items-end text-sm text-gray-500 dark:text-gray-400 pt-2">
        <div>
          {formatDisplayDate(buildLocalEventDate(eventDetails.dates.start.localDate, eventDetails.dates.start.localTime))}
        </div>
        <div>
          {eventDetails.dates.start.localTime ?
            formatDisplayTime(buildLocalEventDate(eventDetails.dates.start.localDate, eventDetails.dates.start.localTime))
            : 'Time TBA'
          }
        </div>
      </div>
      {eventDetails?.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {eventDetails.description}
        </p>
      )}
      <div className="flex flex-col gap-4">
        {eventDetails?._embedded?.venues?.[0] && (
          <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
            <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <p>
              {eventDetails._embedded.venues[0].name},{' '}
              {eventDetails._embedded.venues[0].city.name},{' '}
              {eventDetails._embedded.venues[0].state.name}
            </p>
          </div>
        )}
        <div className="flex items-center gap-3">
          {eventDetails?.attractions?.[0]?.externalLinks?.spotify?.[0]?.url && (
            <a
              href={eventDetails.attractions[0].externalLinks.spotify[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#1DB954] hover:bg-[#1ed760] rounded-full transition-colors duration-150 ease-in-out"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z"/>
              </svg>
              Listen on Spotify
            </a>
          )}
          {eventDetails?._embedded?.attractions?.[0]?.externalLinks?.youtube?.[0]?.url && (
            <a
              href={eventDetails._embedded.attractions[0].externalLinks.youtube[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-[#FF0000] hover:bg-[#FF1a1a] rounded-full transition-colors duration-150 ease-in-out"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                <path d="M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
            </svg>
            Watch on YouTube
          </a>
          )}
          <a
            href={createGoogleCalendarUrl(eventDetails)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 rounded-full transition-colors duration-150 ease-in-out"
          >
            <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            Add to Calendar
          </a>
          {eventDetails?._embedded?.attractions?.[0]?.externalLinks?.homepage?.[0]?.url && (
            <a
              href={eventDetails._embedded.attractions[0].externalLinks.homepage[0].url}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 hover:bg-gray-700 rounded-full transition-colors duration-150 ease-in-out"
            >
              <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
              </svg>
              Visit Website
            </a>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventDetails;
