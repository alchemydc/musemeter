<div align="center">

# MuseMeter

<img src="public/musemeter.png" alt="MuseMeter Logo" width="200" height="200">

> Because if the question is "live music" the answer is always "yes" :)

[![TypeScript](https://img.shields.io/badge/TypeScript-4.9-blue.svg)](https://www.typescriptlang.org/)
[![React](https://img.shields.io/badge/React-19.0-blue.svg)](https://reactjs.org/)
[![Vite](https://img.shields.io/badge/Vite-6.2-646CFF.svg)](https://vitejs.dev/)
[![Tailwind](https://img.shields.io/badge/Tailwind-4.1-38B2AC.svg)](https://tailwindcss.com/)

</div>

## 📖 Documentation

- 📋 [Project Brief](memory-bank/projectbrief.md)
  > Project overview, goals, and scope
  
- 🎯 [Product Context](memory-bank/productContext.md)
  > User experience and feature roadmap
  
- 💻 [Tech Context](memory-bank/techContext.md)
  > Technology stack and architecture decisions
  
- 🏗️ [System Patterns](memory-bank/systemPatterns.md)
  > Design patterns and implementation details
  
- 📊 [Active Context](memory-bank/activeContext.md)
  > Current development status and priorities
  
- 📈 [Progress](memory-bank/progress.md)
  > Development timeline and milestones

## 🚀 Getting Started

```bash
# Clone the repository
git clone https://github.com/alchemydc/musemeter.git

# Install dependencies
npm install

# Start development server
npm run dev
```

## ✨ Features

- 🎵 Discover live music events in your area
- 📅 Add events to your Google Calendar
- 🔍 Search by city and state
- 🌙 Dark mode support
- 🎨 Modern UI with Tailwind CSS

## 🧪 Development

```bash
# Run tests
npm test

# Lint code
npm run lint

# Build for production
npm run build
```



## 🚀 Deployment

### Prerequisites
1. A [Vercel](https://vercel.com) account
2. [Vercel CLI](https://vercel.com/docs/cli) installed: `npm i -g vercel`
3. A Ticketmaster API key

### Environment Variables
Set up the following environment variables in your Vercel project settings:

- `API_KEY`: Your Ticketmaster API key
- `RADIUS`: Search radius for events (default: 50)
- `RADIUS_UNIT`: Unit for radius (default: miles)
- `DEFAULT_EVENTS_PER_PAGE`: Number of events per page (default: 7)

### Deploy to Vercel
```bash
# Login to Vercel
vercel login

# Deploy to Vercel
vercel

# Deploy to production
vercel --prod
```

The project uses Vercel's serverless functions to handle API requests securely. The frontend will be automatically built and deployed as a static site.

### Local Development
To test the serverless functions locally:
```bash
# Install Vercel CLI
npm i -g vercel

# Start development server
vercel dev
```

## 📝 License

[MIT](LICENSE) © 2025 MuseMeter