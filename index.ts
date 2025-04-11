import axios from 'axios';
import * as dotenv from 'dotenv';
dotenv.config();

const API_KEY = process.env.API_KEY; // Retrieve API key from environment variable
const CITY = process.env.CITY; // Retrieve city from environment variable
const RADIUS="50";
const radiusUnit="mi";

interface Event {
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

interface ApiResponse {
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

async function getEvents() {
  try {
    let allEvents: Event[] = [];
    let page = 0;
    let totalPages = 1;
    const pageSize = 20;

    while (page < totalPages) {
      const response = await axios.get<ApiResponse>(
        `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&city=${CITY}&radius=${RADIUS}&radiusUnit=${radiusUnit}&size=${pageSize}&page=${page}`
      );

      if (response.data._embedded && response.data._embedded.events) {
        const events = response.data._embedded.events;
        allEvents = allEvents.concat(events);
      }

      totalPages = response.data.page.totalPages;
      page++;
    }

    allEvents.forEach(event => {
      const venueName = event._embedded?.venues?.[0]?.name || 'Unknown Venue';
      console.log(`Name: ${event.name}, Date: ${event.dates.start.localDate}, Time: ${event.dates.start.localTime}, Venue: ${venueName}`);
    });
  } catch (error) {
    console.error(error);
  }
}

getEvents();
