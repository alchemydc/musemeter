'use client';

import { useState, useEffect, useRef } from 'react';
import { Event, Attraction } from './lib/types';
import { getEvents, getAttractions, getEventsByAttraction, getAttractionDetails } from './lib/events';
import type { ApiResponse } from './lib/types';
import AttractionList from './components/AttractionList';
import EventDetails from './components/EventDetails';
import ClassificationIcon from './components/ClassificationIcon';
import EventRow from './components/EventRow';
import { useDebounce } from './hooks/useDebounce';
import { debug } from './utils/debug';
import { getDayHeading, groupByLocalDate } from './utils/date';

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
  const [notice, setNotice] = useState<string | null>(null);
  const modalRef = useRef<HTMLDivElement>(null);
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
  const [totalEvents, setTotalEvents] = useState(0);
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
      setNotice(null);
      setIsLoading(true);
      debug('Fetching attractions:', {
        keyword: debouncedSearchValue,
        page: currentPage,
        pageSize
      });
      const data: ApiResponse<Attraction> = await getAttractions(debouncedSearchValue, currentPage, pageSize);
      if (!data._embedded?.attractions || data._embedded.attractions.length === 0) {
        setNotice('No artists match that name. Check the spelling or try a shorter name.');
        setAttractions([]);
        setTotalPages(0);
      } else {
        setAttractions(data._embedded.attractions);
        setTotalPages(data.page?.totalPages || 1);
      }
    } catch (error) {
      console.error(error);
      setError('Couldn’t load artists. Try again.');
    } finally {
      setIsLoading(false);
    }
  }

  async function fetchEvents() {
    try {
      setError(null);
      setNotice(null);
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
        setNotice(`No upcoming events in ${debouncedSearchValue}. Try a nearby city.`);
        setEvents([]);
        setTotalPages(0);
      } else {
        setEvents(data._embedded.events);
        setTotalPages(data.page?.totalPages || 1);
        setTotalEvents(data.page?.totalElements ?? data._embedded.events.length);
      }
    } catch (error) {
      console.error(error);
      setError('Couldn’t load events. Try again.');
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

    // One- or two-letter fragments are almost always mid-typing; don't search (or report no results) yet
    if (debouncedSearchValue.trim().length >= 2) {
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

  // Dialog behaviour for the event details modal: lock page scroll, focus inside,
  // close on Escape, keep Tab within the dialog, and hand focus back on close.
  useEffect(() => {
    if (!showEventDetails) return;
    const modal = modalRef.current;
    const previouslyFocused = document.activeElement as HTMLElement | null;
    document.body.style.overflow = 'hidden';
    modal?.querySelector<HTMLElement>('button')?.focus();

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setShowEventDetails(false);
        setSelectedEventId(null);
        return;
      }
      if (e.key !== 'Tab' || !modal) return;
      const focusable = modal.querySelectorAll<HTMLElement>('a[href], button:not([disabled])');
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    document.addEventListener('keydown', onKeyDown);

    return () => {
      document.body.style.overflow = '';
      document.removeEventListener('keydown', onKeyDown);
      previouslyFocused?.focus();
    };
  }, [showEventDetails]);

  const handleAttractionSelect = async (attractionId: string) => {
    setSelectedAttractionId(attractionId);
    setIsSearchingAttractions(false);
    setCurrentPage(0);

    try {
      setError(null);
      setNotice(null);
      setIsLoading(true);
      const attraction = await getAttractionDetails(attractionId);
      debug('Selected attraction:', attraction);

      const data = await getEventsByAttraction(attractionId, 0, pageSize, activeSegmentIds.length ? activeSegmentIds : undefined);
      if (!data._embedded?.events || data._embedded.events.length === 0) {
        setNotice('This artist has no upcoming events.');
        setEvents([]);
        setTotalPages(0);
      } else {
        setEvents(data._embedded.events);
        setTotalPages(data.page?.totalPages || 1);
        setTotalEvents(data.page?.totalElements ?? data._embedded.events.length);
      }

      setSearchValue(attraction.name);
    } catch (error) {
      console.error(error);
      setError('Couldn’t load events for this artist. Try again.');
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
      behavior: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth'
    });
  };

  const handleSearchTypeChange = (newType: 'city' | 'attraction') => {
    setError(null);
    setNotice(null);
    setSearchType(newType);
    setSearchValue('');
    setCurrentPage(0);
  };

  const handleSearchValueChange = (newValue: string) => {
    setError(null);
    setNotice(null);
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
                aria-label="Back to search"
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
                If the question is live music, the answer is yes.
              </p>
            </>
          )}
        </div>

        {/* Search Controls */}
        {!selectedAttractionId && (
          <div className="mb-6 space-y-3">
            {/* Segmented Toggle */}
            <div className="flex justify-center">
              <div role="group" aria-label="Search by" className="inline-flex rounded-full bg-surface-200 dark:bg-surface-800 p-1">
                <button
                  onClick={() => handleSearchTypeChange('city')}
                  aria-pressed={searchType === 'city'}
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
                  aria-pressed={searchType === 'attraction'}
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
              <label htmlFor="search" className="sr-only">
                {searchType === 'city' ? 'City' : 'Artist name'}
              </label>
              <svg aria-hidden="true" className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-surface-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input
                id="search"
                type="search"
                autoComplete="off"
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
                    aria-pressed={isActive}
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
          <div role="alert" className="mb-4 p-4 rounded-xl border-l-4 border-red-500 bg-red-50 dark:bg-red-900/20 flex items-start gap-3">
            <svg className="h-5 w-5 text-red-500 shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
            <p className="text-sm text-red-700 dark:text-red-400">{error}</p>
          </div>
        )}

        {/* Results summary */}
        {!isLoading && !isSearchingAttractions && events.length > 0 && (
          <p className="mb-2 px-3 text-sm text-surface-500 dark:text-surface-400">
            {totalEvents.toLocaleString('en-US')} upcoming {totalEvents === 1 ? 'event' : 'events'}
            {searchType === 'city' && <> near {debouncedSearchValue}</>}
            {activeSegments.size > 0 && <> · {[...activeSegments].join(', ')}</>}
          </p>
        )}

        {/* Content */}
        {isLoading ? (
          /* Skeleton rows */
          <div className="space-y-3" aria-busy="true">
            <span className="sr-only">Loading</span>
            {[...Array(4)].map((_, i) => (
              <div key={i} className="grid grid-cols-[4.5rem_1fr] gap-4 px-3 py-3 animate-pulse">
                <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-14"></div>
                <div>
                  <div className="h-5 bg-surface-200 dark:bg-surface-700 rounded w-3/4 mb-2"></div>
                  <div className="h-4 bg-surface-200 dark:bg-surface-700 rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : notice ? (
          <p role="status" className="py-12 text-center text-sm text-surface-500 dark:text-surface-400">
            {notice}
          </p>
        ) : isSearchingAttractions && attractions.length > 0 ? (
          <AttractionList
            attractions={attractions}
            onSelect={handleAttractionSelect}
          />
        ) : events.length > 0 ? (
          /* Events grouped by day */
          <div className="space-y-6">
            {groupByLocalDate(events).map(({ localDate, items }) => {
              const heading = getDayHeading(localDate);
              return (
                <section key={localDate} aria-label={heading ? `${heading.weekday} ${heading.month} ${heading.day}` : 'Date to be announced'}>
                  <h2 className="flex items-baseline gap-2 border-b border-surface-200 dark:border-surface-800 px-3 pb-2 mb-1">
                    {heading ? (
                      <>
                        <span className="text-2xl font-bold tabular-nums text-surface-900 dark:text-white">{heading.day}</span>
                        <span className="text-sm font-semibold uppercase tracking-wide text-surface-900 dark:text-white">
                          {heading.month}{heading.year && ` ${heading.year}`}
                        </span>
                        <span className="text-sm text-surface-500 dark:text-surface-400">
                          {heading.relative ?? heading.weekday}
                        </span>
                      </>
                    ) : (
                      <span className="text-sm font-semibold text-surface-900 dark:text-white">Date to be announced</span>
                    )}
                  </h2>
                  {items.map((event: Event) => (
                    <EventRow
                      key={event.id}
                      event={event}
                      isLastViewed={event.id === lastClickedId}
                      onSelect={handleEventClick}
                    />
                  ))}
                </section>
              );
            })}
          </div>
        ) : !error && (
          <p className="py-12 text-center text-sm text-surface-500 dark:text-surface-400">
            {searchType === 'city'
              ? 'Type a city to see what’s on.'
              : 'Type an artist’s name to see their upcoming shows.'}
          </p>
        )}

        {/* Pagination */}
        {(events.length > 0 || attractions.length > 0) && (
          <div className="flex items-center justify-center gap-3 mt-6">
            <button
              onClick={() => handlePageChange(currentPage - 1)}
              aria-label="Previous page"
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
              aria-label="Next page"
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
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby="event-details-title"
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
              aria-label="Close"
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
