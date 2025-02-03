# URL Shortener

A simple URL shortener built with Next.js, MongoDB, and Prisma.

## Overview

This project allows users to shorten long URLs and track link statistics. It features a RESTful API to create and retrieve shortened URLs, as well as an automatic redirect mechanism that increments visit counters.

## API Endpoints

### POST /api/shorten

- Creates a new shortened URL.
- **Request Body:**
  ```json
  {
    "url": "https://example.com/long-url"
  }
  ```
- **Response:**
  ```json
  {
    "shortened_id": "abc123"
  }
  ```
- **Error Responses:**
  - 400: URL is required
  - 409: URL has already been shortened
  - 500: Server error

### GET /api/links

- Retrieves the 10 most recent shortened links.
- **Response:**
  ```json
  [
    {
      "id": "...",
      "originalUrl": "https://example.com",
      "shortened_id": "abc123",
      "visits": 0,
      "createdAt": "2023-..."
    }
  ]
  ```

### GET /[shortened_id]

- Redirects to the original URL and increments the visit counter.
- If the shortened_id is invalid, redirects to the homepage.

## Project Structure

```
src/
├── app/
│   ├── api/
│   │   ├── links/
│   │   └── shorten/
│   ├── [shortened_id]/
│   ├── layout.tsx
│   └── page.tsx
├── components/
│   ├── UrlShortener.tsx
│   ├── RecentLinks.tsx
│   └── RecentLinksSkeleton.tsx
└── types/
    └── shortLink.ts
```

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd url-shortener
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Create a `.env` file in the project root with the following variables:

   ```
   DATABASE_URL=your_mongodb_connection_string
   NEXT_PUBLIC_URL=http://localhost:3000
   ```

4. Initialize Prisma:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

5. Start the development server:
   ```bash
   npm run dev
   ```

The application will be available at [http://localhost:3000](http://localhost:3000).

## Deployment

This application is containerized using Docker and can be deployed anywhere that supports Docker containers. A live version is running at:

[https://url-shortener.mohamedaleya.dev](https://url-shortener.mohamedaleya.dev)

The live version is hosted on a VPS using:

- Docker for containerization
- Nginx Proxy Manager for reverse proxy
- MongoDB Atlas for the database

### Important Note About URL Length

Since the application is hosted on `url-shortener.mohamedaleya.dev`, some shortened URLs may appear longer than the original URL due to the length of the subdomain itself. This is purely due to the domain name choice.

For example:

- Original URL: `example.com/path`
- Shortened URL: `url-shortener.mohamedaleya.dev/abc123`

With a shorter domain (like `bit.ly`), the shortened URLs would be much more concise. The URL shortening logic remains effective, but the overall URL length is affected by the hosting domain name length.

### Docker Support

You can run this application using Docker:

```bash
# Build and run with docker-compose
docker-compose up -d

# Or build and run manually
docker build -t url-shortener .
docker run -p 3066:3000 -d url-shortener
```

## Running Tests

The project includes both unit tests and end-to-end tests.

### Unit Tests

Run unit tests with Jest:

```bash
npm test
```

To run tests in watch mode:

```bash
npm test -- --watch
```

### End-to-End Tests

Run Playwright E2E tests:

```bash
# Run E2E tests in headless mode
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui
```

### Run All Tests

To run both unit and E2E tests:

```bash
npm run test:all
```
