import { useState, useEffect } from 'react';
import { Event, Attraction } from './types';
import { getEvents, getAttractions, getEventsByAttraction, getAttractionDetails } from './events';
import type { ApiResponse } from './types';
import AttractionList from './components/AttractionList';
import EventDetails from './EventDetails';
import ClassificationIcon from './components/ClassificationIcon';
import { useDebounce } from './hooks/useDebounce';
import { debug } from './utils/debug';

function App() {
  const [events, setEvents] = useState<Event[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSearchingAttractions, setIsSearchingAttractions] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [lastScrollPosition, setLastScrollPosition] = useState(0);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

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
  const [searchType, setSearchType] = useState<'city' | 'attraction'>('city');
  const [searchValue, setSearchValue] = useState(() => {
    const savedCity = localStorage.getItem('city');
    debug('Initial search value load:', { savedCity, defaulting: !savedCity });
    return savedCity || 'Boulder';
  });

  // Add debounced values
  const debouncedSearchValue = useDebounce(searchValue);

  async function fetchAttractions() {
    try {
      setError(null);
      debug('Fetching attractions:', {
        keyword: debouncedSearchValue,
        page: currentPage,
        pageSize
      });
      const data: ApiResponse<Attraction> = await getAttractions(debouncedSearchValue, currentPage, pageSize);
      if (!data._embedded?.attractions || data._embedded.attractions.length === 0) {
        setError('No attractions found for your search. Please try different keywords.');
        setAttractions([]);
        setTotalPages(0);
      } else {
        setAttractions(data._embedded.attractions);
        setTotalPages(data.page.totalPages);
      }
    } catch (error) {
      console.error(error);
      setError('Failed to fetch attractions. Please try again.');
    }
  }

  async function fetchEvents() {
    try {
      setError(null);
      debug('Fetching events:', { 
        searchType,
        searchValue: debouncedSearchValue, 
        page: currentPage, 
        pageSize 
      });
      const data: ApiResponse<Event> = await getEvents({
        page: currentPage,
        size: pageSize,
        searchType,
        searchValue: debouncedSearchValue
      });
      if (!data._embedded?.events || data._embedded.events.length === 0) {
        setError(`No events found ${searchType === 'city' ? 'in this city' : 'for this search'}. Please try a different ${searchType === 'city' ? 'location' : 'keyword'}.`);
        setEvents([]);
        setTotalPages(0);
      } else {
        setEvents(data._embedded.events);
        setTotalPages(data.page.totalPages);
      }
    } catch (error) {
      console.error(error);
      setError('Failed to fetch events. Please try again.');
    }
  }

  useEffect(() => {
    debug('Effect triggered:', {
      searchType,
      debouncedSearchValue,
      currentPage,
      isInitialLoad: !debouncedSearchValue
    });
    
    if (debouncedSearchValue) {
      if (searchType === 'attraction') {
        setIsSearchingAttractions(true);
        fetchAttractions();
        setEvents([]); // Clear events while searching attractions
      } else {
        setIsSearchingAttractions(false);
        setAttractions([]); // Clear attractions while searching events
        fetchEvents();
      }
    }
  }, [searchType, debouncedSearchValue, currentPage]);

  const handleAttractionSelect = async (attractionId: string) => {
    setSelectedAttractionId(attractionId);
    setIsSearchingAttractions(false);
    setCurrentPage(0);
    
    try {
      const attraction = await getAttractionDetails(attractionId);
      debug('Selected attraction:', attraction);

      const data = await getEventsByAttraction(attractionId);
      if (!data._embedded?.events || data._embedded.events.length === 0) {
        setError('No upcoming events found for this artist/venue.');
        setEvents([]);
        setTotalPages(0);
      } else {
        setEvents(data._embedded.events);
        setTotalPages(data.page.totalPages);
      }

      // Update the search value to show what we're searching for
      setSearchValue(attraction.name);
    } catch (error) {
      console.error(error);
      setError('Failed to load events for this artist/venue. Please try again.');
      setIsSearchingAttractions(true);
      setSelectedAttractionId(null);
    }
  };

  const handlePageChange = (newPage: number) => {
    debug('Page changing:', { from: currentPage, to: newPage });
    setCurrentPage(newPage);
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const handleSearchTypeChange = (newType: 'city' | 'attraction') => {
    setError(null);
    setSearchType(newType);
    setSearchValue(''); // Clear the search text
    setCurrentPage(0);
  };

  const handleSearchValueChange = (newValue: string) => {
    setError(null);
    debug('Search value changing:', { 
      from: searchValue, 
      to: newValue,
      type: searchType
    });
    setSearchValue(newValue);
    if (searchType === 'city') {
      localStorage.setItem('city', newValue);
    } else if (searchType === 'attraction') {
      // Reset any selected attraction when starting a new search
      setSelectedAttractionId(null);
    }
    setCurrentPage(0); // Reset to first page on search change
  };

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-900 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8 text-center">
          {selectedAttractionId ? (
            <div className="flex items-center justify-center gap-2">
              <span>Events for {searchValue}</span>
              <button
                onClick={() => {
                  setSelectedAttractionId(null);
                  setIsSearchingAttractions(true);
                  setSearchValue('');
                }}
                className="ml-2 p-1 rounded-full bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-500 hover:text-gray-600 dark:text-gray-400 dark:hover:text-gray-300 transition-colors"
                title="Return to search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ) : 'MuseMeter'}
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

        {error && (
          <div className="mb-4 p-4 rounded-md bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 text-center">
            {error}
          </div>
        )}
        <div className="flex justify-center items-center gap-2 mb-4">
          <select
            value={searchType}
            onChange={(e) => handleSearchTypeChange(e.target.value as 'city' | 'attraction')}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-indigo-400"
          >
            <option value="city">Search by City</option>
            <option value="attraction">Search by Artist</option>
          </select>
          <input
            type="text"
            placeholder={searchType === 'city' ? "City" : "Artist"}
            value={searchValue}
            onChange={(e) => handleSearchValueChange(e.target.value)}
            className="px-4 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 dark:bg-gray-700 dark:text-gray-200 dark:border-gray-600 dark:focus:ring-indigo-400"
          />
        </div>
        <div className="bg-white dark:bg-gray-800 shadow rounded-lg">
          {isSearchingAttractions ? (
            <AttractionList
              attractions={attractions}
              onSelect={handleAttractionSelect}
            />
          ) : (
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
                    {event._embedded?.venues?.[0] && (
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {[
                          event._embedded.venues[0].city?.name,
                          event._embedded.venues[0].state?.stateCode,
                          event._embedded.venues[0].country?.name !== 'United States Of America'
                            ? event._embedded.venues[0].country?.name
                            : null
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </div>
                    )}
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
          )}
        </div>
        {/* Pagination controls */}
        {(events.length > 0 || attractions.length > 0) && (
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
        )}
        {selectedEventId && <EventDetails eventId={selectedEventId} />}
      </div>
    </div>
  );
}

export default App;
