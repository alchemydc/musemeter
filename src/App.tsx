import React, { useState, useEffect } from 'react';
import './App.css';
import axios from 'axios';
import { Event } from './index';

function App() {
  const [events, setEvents] = useState<Event[]>([]);

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
    <div className="min-h-screen bg-gray-100 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 mb-8 text-center">
          Upcoming Events
        </h1>
        <div className="bg-white shadow rounded-lg">
          <ul className="divide-y divide-gray-200">
            {events.map((event: Event, index: number) => (
              <li key={index} className="hover:bg-gray-50 transition-colors duration-150 ease-in-out">
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <h2 className="text-lg font-semibold text-indigo-600">
                      {event.name}
                    </h2>
                    <span className="text-sm text-gray-500">
                      {new Date(event.dates.start.localDate).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-600">
                    <svg className="h-5 w-5 text-gray-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" 
                        d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                    {event._embedded?.venues?.[0]?.name || 'Unknown Venue'}
                    <span className="mx-2">•</span>
                    {event.dates.start.localTime ? new Date(`2000-01-01T${event.dates.start.localTime}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit'
                    }) : 'Time TBA'}
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
