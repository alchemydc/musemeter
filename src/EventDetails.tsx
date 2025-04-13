import React, { useState, useEffect } from 'react';
import axios from 'axios';

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
  };
}

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
      <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
        {eventDetails.name}
      </h2>
      {eventDetails.description && (
        <p className="text-gray-600 dark:text-gray-300 mb-4">
          {eventDetails.description}
        </p>
      )}
      <div className="text-sm text-gray-500 dark:text-gray-400">
        <p>
          {new Date(eventDetails.dates.start.localDate).toLocaleDateString()} at{' '}
          {new Date(`2000-01-01T${eventDetails.dates.start.localTime}`).toLocaleTimeString()}
        </p>
        {eventDetails._embedded?.venues?.[0] && (
          <p>
            {eventDetails._embedded.venues[0].name},{' '}
            {eventDetails._embedded.venues[0].city.name},{' '}
            {eventDetails._embedded.venues[0].state.name}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventDetails;
