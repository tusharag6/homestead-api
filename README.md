# Homestead Backend

This repository contains the backend services for the Homestead App, a React Native application for booking accommodations. The backend is built with Node.js and Express and interacts with a MongoDB database to manage users, accommodations, bookings.

## Features

- User authentication and authorization
- Accommodation management
- Booking management

## Table of Contents

- [Installation](#installation)
- [Configuration](#configuration)
- [Usage](#usage)
- [API Endpoints](#api-endpoints)

## Installation

To get started with the backend, clone this repository and install the dependencies:

```bash
git clone https://github.com/tusharag6/homestead-api.git
cd homestead-api
npm install
```

## Configuration

Create a `.env` file in the root directory and add the following environment variables. You can use the `.env.sample` file as a template:

```
NODE_ENV=development
MONGODB_URI=mongodb://127.0.0.1:27017
DB_NAME=homestead
PORT=5000
TOKEN_SECRET=homestead
TOKEN_EXPIRY=30d
```

Make sure to replace the placeholders with your actual configuration values.

## Usage

### Running the Development Server

To start the development server, run:

```bash
npm run dev
```

The server will start on `http://localhost:5000`.

### Seeding the Database

To populate the database with initial data, run the seed script:

```bash
npm run seed
```

This will insert accommodation data into your MongoDB database.

## API Endpoints

### Authentication Routes

- `POST /api/auth/register`: Register a new user
- `POST /api/auth/login`: Login a user
- `POST /api/auth/logout`: Logout a user
- `GET /api/auth/me`: Get the logged-in user's profile
- `GET /api/auth/refresh`: Refresh the authentication token

### Accommodation Routes

- `GET /api/accommodations/all`: Get all accommodations
- `GET /api/accommodations/:id`: Get accommodation by ID

### Booking Routes

- `POST /api/bookings/reserve`: Reserve a listing
- `GET /api/bookings/user`: Get bookings for the logged-in user
- `GET /api/bookings/:id`: Get booking by ID
