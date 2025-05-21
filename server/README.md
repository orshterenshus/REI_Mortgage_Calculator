# Apartment Investment Calculator Server

This is the backend server for the Apartment Investment Calculator application. It provides API endpoints for storing, retrieving, and calculating real estate investment data.

## Setup

1. Install dependencies:
```
npm install
```

2. Set up environment variables:
- Copy `.env.example` to `.env`
- Update the MongoDB connection string and other environment variables as needed

3. Start the server:
```
# Development mode with auto-restart
npm run dev

# Production mode
npm start
```

## API Endpoints

### Investments

- `GET /api/calculations` - Get all investments
- `GET /api/calculations/:id` - Get a single investment by ID
- `POST /api/calculations` - Create a new investment
- `PUT /api/calculations/:id` - Update an existing investment
- `DELETE /api/calculations/:id` - Delete an investment

## Database Schema

The application uses MongoDB with the following primary collections:

### Users
Basic user information (to be expanded in the future).

### Investments
Store user investment calculations, inputs, and results.

## Mortgage Data

The server contains CSV files with mortgage repayment data for different loan terms (10, 15, 20, 25, and 30 years) at 4% interest rate.

## Technology Stack

- Node.js
- Express.js
- MongoDB with Mongoose
- RESTful API architecture 