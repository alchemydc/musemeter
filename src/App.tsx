import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Event } from './events';

function App() {
  const [events, setEvents] = useState<Event[]>([]);

  const createPerplexitySearchUrl = (event: Event) => {
    const searchQuery = encodeURIComponent(
      `${event.name} ${event._embedded?.venues?.[0]?.name || ''}`
    );
    return `https://www.perplexity.ai/search?q=${searchQuery}`;
  };

  const createGoogleCalendarUrl = (event: Event) => {
    const startDate = new Date(event.dates.start.localDate);
    if (event.dates.start.localTime) {
      startDate.setHours(
        parseInt(event.dates.start.localTime.split(':')[0]),
        parseInt(event.dates.start.localTime.split(':')[1])
      );
    }
    
    const endDate = new Date(startDate.getTime() + (3 * 60 * 60 * 1000)); // Default 3 hour duration
    
    const params = new URLSearchParams({
      action: 'TEMPLATE',
      text: event.name,
      dates: `${startDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z/${endDate.toISOString().replace(/[-:]/g, '').split('.')[0]}Z`,
      location: event._embedded?.venues?.[0]?.name || '',
      details: `Event details: ${event.url || ''}`
    });

    return `https://calendar.google.com/calendar/render?${params.toString()}`;
  };

  useEffect(() => {
    async function fetchEvents() {
      try {
        const response = await axios.get<{ _embedded: { events: Event[] } }>('/api/events');
        setEvents(response.data._embedded.events);
      } catch (error) {
        console.error(error);
      }
    }

    fetchEvents();
  }, []);

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Upcoming Events
        </h1>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event: Event, index: number) => (
              <li key={index} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <a 
                      href={createPerplexitySearchUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-150"
                    >
                      {event.name}
                    </a>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {new Date(event.dates.start.localDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center justify-between">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event._embedded?.venues?.[0]?.name || 'Unknown Venue'}
                      <span className="mx-2 dark:text-gray-500">•</span>
                      {event.dates.start.localTime ? new Date(`2000-01-01T${event.dates.start.localTime}`).toLocaleTimeString('en-US', {
                        hour: 'numeric',
                        minute: '2-digit'
                      }) : 'Time TBA'}
                    </div>
                    <a
                      href={createGoogleCalendarUrl(event)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center px-3 py-1 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 dark:bg-indigo-500 dark:hover:bg-indigo-600 transition-colors duration-150 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 dark:focus:ring-offset-gray-800"
                    >
                      <svg className="mr-2 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                      </svg>
                      Add to Calendar
                    </a>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}

export default App;
