const express = require('express');
const cors = require('cors');
const axios = require('axios');
require('dotenv').config();

const app = express();
const port = 3000;

app.use(cors());

const API_KEY = process.env.API_KEY;
const CITY = process.env.CITY;
const RADIUS = process.env.RADIUS || '50';
const radiusUnit = process.env.RADIUS_UNIT || 'mi';

app.get('/api/events', async (req, res) => {
  try {
    const response = await axios.get(
      `https://app.ticketmaster.com/discovery/v2/events.json?apikey=${API_KEY}&city=${CITY}&radius=${RADIUS}&radiusUnit=${radiusUnit}`
    );
    res.json(response.data);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to fetch events' });
  }
});

app.listen(port, () => {
  const message = `
=================================
🎵 MuseMeter Server Ready!
📍 Local:    http://localhost:${port}
🔑 API Path: /api/events
=================================
`;
  console.log(message);
});
