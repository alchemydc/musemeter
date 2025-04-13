export interface Event {
  id: string;
  name: string;
  type: string;
  dates: {
    start: {
      localDate: string;
      localTime: string;
    };
  };
  _embedded?: {
    venues?: { name: string }[];
  };
  url?: string;
  // Add other properties as needed
}

export interface ApiResponse {
  _embedded?: {
    events: Event[];
  };
  page: {
    totalElements: number;
    totalPages: number;
    number: number;
    size: number;
  };
  _links?: {
    self: { href: string };
    first?: { href: string };
    last?: { href: string };
    next?: { href: string };
    prev?: { href: string };
  };
}

export const getEvents = async (page: number = 0, size: number = 20, city: string = '', state: string = ''): Promise<ApiResponse> => {
  try {
    let url = `/api/events?page=${page}&size=${size}`;
    if (city) {
      url += `&city=${city}`;
    }
    if (state) {
      url += `&state=${state}`;
    }
    const response = await fetch(url);
    
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const data: ApiResponse = await response.json();
    
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

export const hasNextPage = (response: ApiResponse): boolean => {
  return !!response._links?.next;
}

export const hasPreviousPage = (response: ApiResponse): boolean => {
  return !!response._links?.prev;
}
