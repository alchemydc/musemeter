# Ticketmaster API Documentation

## Overview

The official documentation for the Ticketmaster API can be found here: https://developer.ticketmaster.com/products-and-docs/apis/discovery-api/v2/

## Authentication

The Ticketmaster API uses API keys for authentication. You will need to obtain an API key from the Ticketmaster Developer Portal in order to use the API.

API keys should be passed as a query parameter named `apikey` in each request. For example:

`https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_API_KEY`

## API Endpoints

### Event Discovery API

The Event Discovery API allows you to search for events based on various criteria, such as keyword, city, state, and date.

The base URL for the Event Discovery API is:

`https://app.ticketmaster.com/discovery/v2/events.json`

The following parameters can be used to filter the results:

*   `apikey`: Your API key.
*   `keyword`: A keyword to search for.
*   `city`: The city to search in.
*   `stateCode`: The state to search in.
*   `countryCode`: The country to search in.
*   `startDateTime`: The start date and time to search for.
*   `endDateTime`: The end date and time to search for.
*   `radius`: The radius to search within.
*   `unit`: The unit of the radius (miles or km).
*   `page`: The page number to retrieve.
*   `size`: The number of results to return per page.

### Event Details API

The Event Details API allows you to retrieve detailed information about a specific event.

The base URL for the Event Details API is:

`https://app.ticketmaster.com/discovery/v2/events/{eventId}.json`

Where `{eventId}` is the ID of the event you want to retrieve.

The following parameters can be used to filter the results:

*   `apikey`: Your API key.

## Data Models

The Event Discovery API and Event Details API return different data models.

The Event Discovery API returns a list of events, with each event containing the following information:

*   `name`: The name of the event.
*   `id`: The ID of the event.
*   `url`: The URL of the event.
*   `dates`: The dates and times of the event.
*   `_embedded`: Embedded resources, such as venues and attractions.

The Event Details API returns detailed information about a specific event, including all of the information listed above, as well as the following information:

*   `description`: A description of the event.
*   `images`: Images of the event.
*   `priceRanges`: The price ranges for the event.
*   `seatmap`: A seatmap of the event.

## Pagination

The Ticketmaster API uses pagination to return large sets of data. The `page` and `size` parameters can be used to control the pagination.

The `page` parameter specifies the page number to retrieve. The default value is 0.

The `size` parameter specifies the number of results to return per page. The default value is 20. The maximum value is 200.

The response includes `_links`, `_embedded`, and `page` objects.
- The `page` object contains information about the current page in the data source.

## Rate Limits

The Ticketmaster API has rate limits to prevent abuse and ensure fair usage. The specific rate limits vary depending on the API endpoint and the API key.

If you exceed the rate limits, you will receive a 429 Too Many Requests error. You should handle this error gracefully and retry the request after a short delay.

The current code handles 429 rate limiting errors.

## Examples

### Example 1: Search for events in Denver

`https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_API_KEY&city=Denver`

This will return a list of events in Denver.

### Example 2: Search for events in Denver with the keyword "music"

`https://app.ticketmaster.com/discovery/v2/events.json?apikey=YOUR_API_KEY&city=Denver&keyword=music`

This will return a list of events in Denver with the keyword "music".

### Example 3: Get details for a specific event

`https://app.ticketmaster.com/discovery/v2/events/{eventId}.json?apikey=YOUR_API_KEY`

Replace `{eventId}` with the ID of the event you want to retrieve.
