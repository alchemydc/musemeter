import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Event, getEvents, ApiResponse } from './events';
import EventDetails from './EventDetails';
import ClassificationIcon from './components/ClassificationIcon';
import { useDebounce } from './hooks/useDebounce';
import { debug } from './utils/debug';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);

  const handleEventClick = (eventId: string) => {
    setLastClickedId(eventId);
    setLastScrollPosition(window.scrollY);
    setSelectedEventId(eventId);
    setShowEventDetails(true);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleCloseDetails = () => {
    setShowEventDetails(false);
    setSelectedEventId(null);
    // Restore last scroll position
    window.scrollTo({
      top: lastScrollPosition,
      behavior: 'smooth'
    });
  };

  const [totalPages, setTotalPages] = useState(0);
  const pageSize = parseInt(import.meta.env.VITE_DEFAULT_EVENTS_PER_PAGE) || 10;
  const [city, setCity] = useState(() => {
    const savedCity = localStorage.getItem('city');
    debug('Initial city load:', { savedCity, defaulting: !savedCity });
    return savedCity || 'Boulder';
  });

  // Add debounced values
  const debouncedCity = useDebounce(city);

  async function fetchEvents() {
    try {
      debug('Fetching events:', { 
        city: debouncedCity, 
        page: currentPage, 
        pageSize 
      });
      const data: ApiResponse = await getEvents(currentPage, pageSize, debouncedCity);
      setEvents(data._embedded?.events || []);
      setTotalPages(data.page.totalPages);
    } catch (error) {
      console.error(error);
    }
  }

  // Combine the two effects into one that handles both city changes and pagination
  useEffect(() => {
    debug('Effect triggered:', {
      debouncedCity,
      currentPage,
      isInitialLoad: !debouncedCity
    });
    
    if (debouncedCity) {
      fetchEvents();
    }
  }, [debouncedCity, currentPage]); // Only these two dependencies

  const handlePageChange = (newPage: number) => {
    debug('Page changing:', { from: currentPage, to: newPage });
    setCurrentPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleCityChange = (newCity: string) => {
    debug('City changing:', { 
      from: city, 
      to: newCity, 
      storedCity: localStorage.getItem('city') 
    });
    setCity(newCity);
    localStorage.setItem('city', newCity);
    setCurrentPage(0); // Reset to first page on city change
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          Upcoming Events
        </h1>

        {/* Show event details when an event is selected */}
        {showEventDetails && selectedEventId && (
          <div className="mb-8 relative">
            <button
              onClick={handleCloseDetails}
              className="absolute top-4 right-4 text-gray-400 hover:text-gray-500 dark:text-gray-500 dark:hover:text-gray-400"
            >
              <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <EventDetails eventId={selectedEventId} />
          </div>
        )}

        <div className="flex justify-center mb-4">
          <input
            type="text"
            placeholder="City"
            value={city}
            onChange={(e) => handleCityChange(e.target.value)}
            className="px-4 py-2 mr-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-indigo-400"
          />
          <button
            onClick={() => handleSearch()}
            className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-indigo-500 dark:hover:bg-indigo-600 dark:focus:ring-indigo-400"
          >
            Search
          </button>
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          <ul className="divide-y divide-gray-200 dark:divide-gray-700">
            {events.map((event: Event, index: number) => (
              <li 
                key={index} 
                className={`hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-150 ease-in-out
                  ${event.id === lastClickedId ? 'bg-gray-50 dark:bg-gray-700' : ''}`}
              >
                <div className="px-6 py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex flex-col">
                      <div className="flex items-center gap-2">
                        {event.classifications?.[0]?.segment?.name && (
                          <ClassificationIcon
                            segmentName={event.classifications[0].segment.name}
                            className="h-5 w-5 text-gray-400 dark:text-gray-500"
                          />
                        )}
                        <a
                          href="#"
                          onClick={() => handleEventClick(event.id)}
                          className="text-lg font-semibold text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 transition-colors duration-150"
                        >
                          {event.name}
                        </a>
                      </div>
                    </div>
                    <div className="flex flex-col items-end text-sm text-gray-500 dark:text-gray-400">
                      <div>
                        {new Date(event.dates.start.localDate).toLocaleDateString('en-US', {
                          weekday: 'short',
                          month: 'short',
                          day: 'numeric'
                        })}
                      </div>
                      <div>
                        {event.dates.start.localTime ?
                          new Date(`2000-01-01T${event.dates.start.localTime}`).toLocaleTimeString('en-US', {
                            hour: 'numeric',
                            minute: '2-digit'
                          })
                          : 'Time TBA'
                        }
                      </div>
                    </div>
                  </div>
                  <div className="mt-2 flex items-center">
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                      <svg className="h-5 w-5 text-gray-400 dark:text-gray-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                          d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                      </svg>
                      {event._embedded?.venues?.[0]?.name || 'Unknown Venue'}
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>
        <div className="flex justify-center mt-4">
          <button
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 0}
            className="px-4 py-2 mx-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Previous
          </button>
          <span className="text-gray-700 dark:text-gray-200">
            Page {currentPage + 1} of {totalPages}
          </span>
          <button
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages - 1}
            className="px-4 py-2 mx-2 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-200 rounded-md disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Next
          </button>
        </div>
        {selectedEventId && <EventDetails eventId={selectedEventId} />}
      </div>
    </div>
  );
}

export default App;
