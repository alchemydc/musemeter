import { Event, Attraction, ApiResponse } from './types';

const defaultEventsPerPage = process.env.NEXT_PUBLIC_DEFAULT_EVENTS_PER_PAGE || '10';

export interface SearchParams {
  page: number;
  size: number;
  searchType: 'city' | 'keyword' | 'attraction';
  searchValue: string;
  segments?: string[];
}

export const getEvents = async ({
  page = 0,
  size = Number(defaultEventsPerPage),
  searchType = 'city',
  searchValue = '',
  segments
}: SearchParams): Promise<ApiResponse<Event>> => {
  try {
    let url = `/api/events?page=${page}&size=${size}`;
    if (searchValue) {
      if (searchType === 'attraction') {
        url += `&keyword=${searchValue}`;
      } else {
        url += `&${searchType}=${searchValue}`;
      }
    }
    if (segments?.length) {
      url += `&segmentId=${segments.join(',')}`;
    }
    const response = await fetch(url);

    const data: ApiResponse<Event> = await response.json();

    if (!response.ok) {
      // Extract error message from response if available
      const errorMessage = data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }

    // Debug log classifications
    if (process.env.NODE_ENV === 'development') {
      data._embedded?.events?.forEach((event: Event) => {
        console.log(`Event ${event.name} classifications:`,
          event.classifications?.map((c) => c.segment?.name)
        );
      });
    }

    // Validate pagination data
    if (!data.page) {
      throw new Error('Invalid API response: missing pagination data');
    }

    return data;
  } catch (error) {
    console.error('Failed to fetch events:', error);
    throw error;
  }
}

export const getAttractions = async (keyword: string, page = 0, size = Number(defaultEventsPerPage)): Promise<ApiResponse<Attraction>> => {
  try {
    const response = await fetch(`/api/attractions?keyword=${encodeURIComponent(keyword)}&page=${page}&size=${size}`);

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch attractions:', error);
    throw error;
  }
};

export const getAttractionDetails = async (attractionId: string): Promise<Attraction> => {
  try {
    const response = await fetch(`/api/attractions/${attractionId}`);

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch attraction details:', error);
    throw error;
  }
};

export const getEventsByAttraction = async (attractionId: string, page = 0, size = Number(defaultEventsPerPage), segments?: string[]): Promise<ApiResponse<Event>> => {
  try {
    const attraction = await getAttractionDetails(attractionId);
    let url = `/api/events?page=${page}&size=${size}&keyword=${encodeURIComponent(attraction.name)}`;
    if (segments?.length) {
      url += `&segmentId=${segments.join(',')}`;
    }
    const response = await fetch(url);

    const data = await response.json();
    if (!response.ok) {
      const errorMessage = data.error || `HTTP error! status: ${response.status}`;
      throw new Error(errorMessage);
    }
    return data;
  } catch (error) {
    console.error('Failed to fetch events for attraction:', error);
    throw error;
  }
};

export const hasNextPage = (response: ApiResponse<Event | Attraction>): boolean => {
  return !!response._links?.next;
}

export const hasPreviousPage = (response: ApiResponse<Event | Attraction>): boolean => {
  return !!response._links?.prev;
}
