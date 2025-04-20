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
    venues?: { 
      name: string;
      markets?: { name: string }[];
      city?: { name: string };
      state?: { name: string; stateCode: string };
      country?: { name: string; countryCode: string };
    }[];
  };
  url?: string;
  classifications?: {
    primary: boolean;
    segment: {
      id: string;
      name: string;
    };
    genre: {
      id: string;
      name: string;
    };
    subGenre: {
      id: string;
      name: string;
    };
    type: {
      id: string;
      name: string;
    };
    subType: {
      id: string;
      name: string;
    };
    family: boolean;
  }[];
}

export interface Attraction {
  id: string;
  name: string;
  type: string;
  images?: {
    url: string;
    ratio: string;
    width: number;
    height: number;
  }[];
  classifications?: {
    primary: boolean;
    segment: {
      id: string;
      name: string;
    };
  }[];
}

export interface ApiResponse<T> {
  _embedded?: {
    events?: Event[];
    attractions?: Attraction[];
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
