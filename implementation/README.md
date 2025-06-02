# Eurobot Dashboard

A comprehensive dashboard for the Eurobot competition, built with Next.js and MongoDB. This application displays match results, team rankings, and performance analytics across multiple competition series.

## Features

- **Match Management**: View and manage match results across different series
- **Team Rankings**: Display team standings with detailed statistics
- **Performance Analytics**: Interactive charts showing team performance
- **NoSQL Database**: MongoDB integration for efficient data storage and retrieval
- **Responsive Design**: Works on desktop and mobile devices
- **Real-time Data**: API-driven architecture for dynamic data updates

## Technology Stack

- **Frontend**: Next.js 15, React 19, TypeScript
- **Styling**: Tailwind CSS, Chakra UI
- **Database**: MongoDB with Mongoose ODM
- **Charts**: Recharts for data visualization
- **Data Processing**: Custom API routes and services

## Getting Started

### Prerequisites

- Node.js 18+ and npm
- MongoDB (local installation or Docker)

### Installation

1. Clone the repository and navigate to the implementation directory:
```bash
cd implementation
```

2. Install dependencies:
```bash
npm install
```

3. Set up MongoDB:
```bash
# Using Docker (recommended)
docker run --name eurobot-mongo -p 27017:27017 -d mongo:latest

# Or install MongoDB locally
# Follow instructions at https://docs.mongodb.com/manual/installation/
```

4. Configure environment variables:
The `.env.local` file is already created with default settings. Update it if needed:
```env
MONGODB_URI=mongodb://localhost:27017/eurobot_dashboard
NEXT_PUBLIC_API_URL=
```

5. Start the development server:
```bash
npm run dev
```

6. Open [http://localhost:3000](http://localhost:3000) in your browser

### Data Migration

1. Navigate to [http://localhost:3000/migrate](http://localhost:3000/migrate)
2. Click "Start Migration" to transfer CSV data to MongoDB
3. Wait for the migration to complete
4. Return to the main dashboard to view the data

## Project Structure

```
src/
├── app/                 # Next.js app router pages
│   ├── api/            # API routes
│   ├── migrate/        # Data migration page
│   └── page.tsx        # Main dashboard
├── components/         # React components
├── lib/               # Database connection
├── models/            # Mongoose data models
├── services/          # Data service layer
├── types/             # TypeScript type definitions
└── utils/             # Utility functions
```

## API Endpoints

- `GET /api/matches` - Fetch matches (optional ?series=1,2,3)
- `POST /api/matches` - Create new match
- `GET /api/rankings` - Fetch team rankings (optional ?series=1,2,3)
- `POST /api/rankings` - Create new ranking
- `POST /api/migrate` - Migrate CSV data to MongoDB

## Database Schema

The application uses two main collections:

- **Matches**: Store match results with team information and scores
- **TeamRankings**: Store team standings and statistics

See [NOSQL_MIGRATION.md](./NOSQL_MIGRATION.md) for detailed schema information.

## Development

### Adding New Features

1. Create new API routes in `src/app/api/`
2. Add corresponding service functions in `src/services/`
3. Update components to use the new data
4. Add proper TypeScript types in `src/types/`

### Database Operations

- Use Mongoose models for all database operations
- Leverage database indexes for performance
- Handle errors gracefully with proper error messages

## Deployment

### Environment Variables

Set the following environment variables in production:

```env
MONGODB_URI=your_mongodb_connection_string
NEXT_PUBLIC_API_URL=your_api_base_url
```

### Vercel Deployment

1. Connect your repository to Vercel
2. Set environment variables in Vercel dashboard
3. Deploy automatically on push to main branch

### Docker Deployment

```bash
# Build the application
docker build -t eurobot-dashboard .

# Run with environment variables
docker run -p 3000:3000 -e MONGODB_URI=your_connection_string eurobot-dashboard
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## Documentation

- [NoSQL Migration Guide](./NOSQL_MIGRATION.md) - Detailed migration documentation
- [API Documentation](./API.md) - API endpoint specifications
- [Component Guide](./COMPONENTS.md) - React component documentation

## License

This project is licensed under the MIT License - see the LICENSE file for details.
