# Apartment Investment Calculator

מחשבון השקעות בנדל"ן - אפליקציה לחישוב כדאיות השקעה בנכסי נדל"ן.

## Project Structure

This application follows a client-server architecture:

- `/client` - React frontend application
- `/server` - Node.js/Express backend with MongoDB integration

## Features

- Real estate investment calculator
- ROI, cash flow, and equity calculations
- Mortgage payment calculations based on accurate mortgage tables
- 30-year investment forecasting
- Save and load investment scenarios
- MongoDB database integration

## Setup Instructions

### Prerequisites

- Node.js (v14+)
- MongoDB (local or cloud instance)

### Installation

1. Clone the repository
2. Install dependencies for all projects:
```
npm run install:all
```

3. Set up MongoDB:
   - Create a MongoDB database (locally or using MongoDB Atlas)
   - Copy `server/.env.example` to `server/.env` and configure your database connection

4. Start development servers (both client and server):
```
npm run dev
```

### Production Deployment

1. Build the client:
```
npm run build
```

2. Start the server only:
```
npm start
```

## API Documentation

The server provides REST API endpoints for:

- Storing and retrieving investment calculations
- User authentication (future feature)
- Performing calculations on the server side

Refer to the `server/README.md` for detailed API documentation.

## Technology Stack

### Frontend
- React.js
- Emotion (CSS-in-JS)
- Chart.js
- Webpack

### Backend
- Node.js
- Express.js
- MongoDB with Mongoose

## Mortgage Data

The application includes accurate mortgage payment tables for 10, 15, 20, 25, and 30-year terms at 4% interest rate. 