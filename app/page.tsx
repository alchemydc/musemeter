'use client';

import { useState, useEffect } from 'react';
import { Event, Attraction } from './lib/types';
import { getEvents, getAttractions, getEventsByAttraction, getAttractionDetails } from './lib/events';
import type { ApiResponse } from './lib/types';
import AttractionList from './components/AttractionList';
import EventDetails from './components/EventDetails';
import ClassificationIcon from './components/ClassificationIcon';
import { useDebounce } from './hooks/useDebounce';
import { debug } from './utils/debug';
import { buildLocalEventDate, formatDisplayDate, formatDisplayTime } from './utils/date';

const pageSize = parseInt(process.env.NEXT_PUBLIC_DEFAULT_EVENTS_PER_PAGE || '') || 10;

const SEGMENT_IDS: Record<string, string> = {
  Music: 'KZFzniwnSyZfZ7v7nJ',
  Sports: 'KZFzniwnSyZfZ7v7nE',
  'Arts & Theatre': 'KZFzniwnSyZfZ7v7na',
};

const SEGMENT_ICON_NAMES: Record<string, string> = {
  Music: 'music',
  Sports: 'sports',
  'Arts & Theatre': 'arts',
};

export default function Home() {
  const [events, setEvents] = useState<Event[]>([]);
  const [attractions, setAttractions] = useState<Attraction[]>([]);
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedAttractionId, setSelectedAttractionId] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(0);
  const [isSearchingAttractions, setIsSearchingAttractions] = useState(false);
  const [showEventDetails, setShowEventDetails] = useState(false);
  const [lastClickedId, setLastClickedId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [activeSegments, setActiveSegments] = useState<Set<string>>(() => {
    if (typeof window === 'undefined') return new Set();
    try {
      const saved = localStorage.getItem('activeSegments');
      return saved ? new Set(JSON.parse(saved)) : new Set();
    } catch {
      return new Set();
    }
  });

  const handleEventClick = (eventId: string) => {
    setLastClickedId(eventId);
    setSelectedEventId(eventId);
    setShowEventDetails(true);
  };

  const handleCloseDetails = () => {
    setShowEventDetails(false);
    setSelectedEventId(null);
  };

  const [totalPages, setTotalPages] = useState(0);
  const [searchType, setSearchType] = useState<'city' | 'attraction'>('city');
  const [searchValue, setSearchValue] = useState(() => {
    if (typeof window === 'undefined') return 'Boulder';
    const savedCity = localStorage.getItem('city');
    debug('Initial search value load:', { savedCity, defaulting: !savedCity });
    return savedCity || 'Boulder';
  });

  const debouncedSearchValue = useDebounce(searchValue);

  async function fetchAttractions() {
    try {
      setError(null);
      setIsLoading(true);
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
        setTotalPages(data.page?.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
      setError('Failed to fetch attractions. Please try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEvents() {
    try {
      setError(null);
      setIsLoading(true);
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
        searchValue: debouncedSearchValue,
        segments: activeSegmentIds.length ? activeSegmentIds : undefined
      });
      if (!data._embedded?.events || data._embedded.events.length === 0) {
        setError(`No events found ${searchType === 'city' ? 'in this city' : 'for this search'}. Please try a different ${searchType === 'city' ? 'location' : 'keyword'}.`);
        setEvents([]);
        setTotalPages(0);
      } else {
        setEvents(data._embedded.events);
        setTotalPages(data.page?.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
      setError('Failed to fetch events. Please try again.');
    } finally {
      setIsLoading(false);
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
      if (searchType === 'attraction' && !selectedAttractionId) {
        setIsSearchingAttractions(true);
        fetchAttractions();
        setEvents([]);
      } else if (searchType !== 'attraction') {
        setIsSearchingAttractions(false);
        setAttractions([]);
        fetchEvents();
      }
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchType, debouncedSearchValue, currentPage, activeSegments]);

  const handleAttractionSelect = async (attractionId: string) => {
    setSelectedAttractionId(attractionId);
    setIsSearchingAttractions(false);
    setCurrentPage(0);

    try {
      setIsLoading(true);
      const attraction = await getAttractionDetails(attractionId);
      debug('Selected attraction:', attraction);

      const data = await getEventsByAttraction(attractionId, 0, pageSize, activeSegmentIds.length ? activeSegmentIds : undefined);
      if (!data._embedded?.events || data._embedded.events.length === 0) {
        setError('No upcoming events found for this artist/venue.');
        setEvents([]);
        setTotalPages(0);
      } else {
        setEvents(data._embedded.events);
        setTotalPages(data.page?.totalPages || 1);
      }

      setSearchValue(attraction.name);
    } catch (error) {
      console.error(error);
      setError('Failed to load events for this artist/venue. Please try again.');
      setIsSearchingAttractions(true);
      setSelectedAttractionId(null);
    } finally {
      setIsLoading(false);
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
    setSearchValue('');
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
      setSelectedAttractionId(null);
    }
    setCurrentPage(0);
  };

  const handleSegmentToggle = (segmentLabel: string) => {
    setActiveSegments(prev => {
      const next = new Set(prev);
      if (next.has(segmentLabel)) {
        next.delete(segmentLabel);
      } else {
        next.add(segmentLabel);
      }
      localStorage.setItem('activeSegments', JSON.stringify([...next]));
      return next;
    });
    setCurrentPage(0);
  };

  const activeSegmentIds = [...activeSegments].map(label => SEGMENT_IDS[label]).filter(Boolean);

  return (
    <div className="min-h-screen bg-surface-50 dark:bg-surface-950 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          {selectedAttractionId ? (
            <div className="flex items-center justify-center gap-3">
              <button
                onClick={() => {
                  setSelectedAttractionId(null);
                  setIsSearchingAttractions(true);
                  setSearchValue('');
                }}
                className="p-2 rounded-full bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors"
                title="Back to search"
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
                </svg>
              </button>
              <h1 className="text-3xl md:text-4xl font-bold text-surface-900 dark:text-white">
                Events for {searchValue}
              </h1>
            </div>
          ) : (
            <>
              <h1 className="text-4xl md:text-5xl font-bold bg-gradient-to-r from-brand-400 to-brand-600 bg-clip-text text-transparent">
                MuseMeter
              </h1>
              <p className="mt-2 text-surface-500 dark:text-surface-400 text-sm">
                Discover live events near you
              </p>
            </>
          )}
        </div>

        {/* Search Controls */}
        {!selectedAttractionId && (
          <div className="mb-6 space-y-3">
            {/* Segmented Toggle */}
            <div className="flex justify-center">
              <div className="inline-flex rounded-full bg-surface-200 dark:bg-surface-800 p-1">
                <button
                  onClick={() => handleSearchTypeChange('city')}
                  className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all ${
                    searchType === 'city'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                  }`}
                >
                  City
                </button>
                <button
                  onClick={() => handleSearchTypeChange('attraction')}
                  className={`px-5 py-1.5 text-sm font-medium rounded-full transition-all ${
                    searchType === 'attraction'
                      ? 'bg-brand-500 text-white shadow-sm'
                      : 'text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                  }`}
                >
                  Artist
                </button>
              </div>
            </div>
            {/* Search Input */}
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                type="text"
                placeholder={searchType === 'city' ? "Search by city..." : "Search by artist..."}
                value={searchValue}
                onChange={(e) => handleSearchValueChange(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-xl border border-surface-200 dark:border-surface-700 bg-white dark:bg-surface-900 text-surface-900 dark:text-surface-100 placeholder-surface-400 focus:outline-none focus:ring-2 focus:ring-brand-500 focus:border-transparent transition-shadow"
              />
            </div>

            {/* Segment Filter Toggles */}
            <div className="flex justify-center gap-2">
              {Object.keys(SEGMENT_IDS).map((label) => {
                const isActive = activeSegments.has(label);
                return (
                  <button
                    key={label}
                    onClick={() => handleSegmentToggle(label)}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all ${
                      isActive
                        ? 'bg-brand-500 text-white shadow-sm'
                        : 'bg-surface-200 dark:bg-surface-800 text-surface-600 dark:text-surface-400 hover:text-surface-900 dark:hover:text-white'
                    }`}
                  >
                    <ClassificationIcon
                      segmentName={SEGMENT_ICON_NAMES[label]}
                      className="h-3.5 w-3.5"
                    />
                    {label}
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* Error Banner */}
        {error && (
          <div className="mb-4 p-4 rounded-xl border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Content */}
        {isSearchingAttractions ? (
          <AttractionList
            attractions={attractions}
            onSelect={handleAttractionSelect}
          />
        ) : isLoading ? (
          /* Skeleton Cards */
          <div className="space-y-3">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="bg-white dark:bg-surface-900 rounded-xl p-4 shadow-sm animate-pulse">
                <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-3/4 mb-3"></div>
                <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2 mb-2"></div>
                <div className="h-6 bg-surface-200 dark:bg-surface-700 rounded-full w-28"></div>
              </div>
            ))}
          </div>
        ) : (
          /* Event Cards */
          <div className="space-y-3">
            {events.map((event: Event, index: number) => (
              <div
                key={index}
                onClick={() => handleEventClick(event.id)}
                className={`bg-white dark:bg-surface-900 rounded-xl p-4 shadow-sm cursor-pointer
                  hover:shadow-md hover:ring-1 hover:ring-brand-200 dark:hover:ring-brand-800 transition-all
                  ${event.id === lastClickedId ? 'ring-1 ring-brand-300 dark:ring-brand-700' : ''}`}
              >
                <div className="flex items-start gap-2 mb-1">
                  {event.classifications?.[0]?.segment?.name && (
                    <ClassificationIcon
                      segmentName={event.classifications[0].segment.name}
                      className="h-5 w-5 text-surface-400 dark:text-surface-500 shrink-0 mt-0.5"
                    />
                  )}
                  <h3 className="text-base font-semibold text-surface-900 dark:text-white line-clamp-2">
                    {event.name}
                  </h3>
                </div>
                <div className="flex items-center text-sm text-surface-500 dark:text-surface-400 mb-2">
                  <svg className="h-4 w-4 mr-1 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2"
                      d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                  <span className="truncate">
                    {event._embedded?.venues?.[0]?.name || 'Unknown Venue'}
                    {event._embedded?.venues?.[0] && (
                      <span className="text-surface-400 dark:text-surface-500">
                        {' '}&middot;{' '}
                        {[
                          event._embedded.venues[0].city?.name,
                          event._embedded.venues[0].state?.stateCode,
                          event._embedded.venues[0].country?.name !== 'United States Of America'
                            ? event._embedded.venues[0].country?.name
                            : null
                        ]
                          .filter(Boolean)
                          .join(', ')}
                      </span>
                    )}
                  </span>
                </div>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300">
                  {formatDisplayDate(buildLocalEventDate(event.dates.start.localDate, event.dates.start.localTime))}
                  {event.dates.start.localTime && (
                    <span className="ml-1.5 text-brand-500 dark:text-brand-400">
                      {formatDisplayTime(buildLocalEventDate(event.dates.start.localDate, event.dates.start.localTime))}
                    </span>
                  )}
                  {!event.dates.start.localTime && (
                    <span className="ml-1.5 text-brand-500 dark:text-brand-400">Time TBA</span>
                  )}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Pagination */}
        {(events.length > 0 || attractions.length > 0) && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              disabled={currentPage === 0}
              className="p-2 rounded-full bg-white dark:bg-surface-900 shadow-sm border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 19l-7-7 7-7" />
              </svg>
            </button>
            <span className="text-sm font-medium text-surface-600 dark:text-surface-300">
              {currentPage + 1} / {totalPages}
            </span>
            <button
              onClick={() => handlePageChange(currentPage + 1)}
              disabled={currentPage === totalPages - 1}
              className="p-2 rounded-full bg-white dark:bg-surface-900 shadow-sm border border-surface-200 dark:border-surface-700 text-surface-600 dark:text-surface-300 disabled:opacity-40 disabled:cursor-not-allowed hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
              </svg>
            </button>
          </div>
        )}
      </div>

      {/* Modal Backdrop + Sheet */}
      {showEventDetails && selectedEventId && (
        <div
          className="fixed inset-0 z-50 animate-fade-in"
          onClick={handleCloseDetails}
        >
          {/* Backdrop */}
          <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" />
          {/* Modal */}
          <div
            className="fixed inset-x-0 bottom-0 md:inset-auto md:top-1/2 md:left-1/2 md:-translate-x-1/2 md:-translate-y-1/2
              bg-white dark:bg-surface-900 rounded-t-2xl md:rounded-2xl max-h-[85vh] md:max-h-[80vh] md:w-full md:max-w-lg
              overflow-y-auto shadow-2xl animate-slide-up"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Drag handle (mobile) */}
            <div className="flex justify-center pt-3 pb-1 md:hidden">
              <div className="w-10 h-1 rounded-full bg-surface-300 dark:bg-surface-600" />
            </div>
            {/* Close button */}
            <button
              onClick={handleCloseDetails}
              className="absolute top-3 right-3 p-1.5 rounded-full bg-surface-100 hover:bg-surface-200 dark:bg-surface-800 dark:hover:bg-surface-700 text-surface-500 hover:text-surface-700 dark:text-surface-400 dark:hover:text-surface-200 transition-colors z-10"
            >
              <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            <div className="p-5">
              <EventDetails eventId={selectedEventId} />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
