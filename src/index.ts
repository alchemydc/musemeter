export interface Event {
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
}
