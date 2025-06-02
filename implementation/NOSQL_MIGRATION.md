# NoSQL Migration Guide

This document explains how the Eurobot Dashboard has been migrated from CSV file storage to a NoSQL MongoDB solution.

## Overview

The application has been updated to use MongoDB as the primary data storage instead of parsing CSV files directly. This provides better performance, scalability, and data management capabilities.

## Architecture Changes

### Before (CSV-based)
- Data stored in CSV files in `public/data/`
- `dataParser.ts` parsed CSV files using PapaParse
- Data fetched on every page load by parsing CSV files

### After (MongoDB-based)
- Data stored in MongoDB collections
- RESTful API endpoints for data operations
- Mongoose ODM for data modeling and validation
- Efficient querying with database indexes

## New Components

### 1. Database Connection (`src/lib/mongodb.ts`)
- Manages MongoDB connection with connection pooling
- Handles connection caching for development hot reloads

### 2. Data Models
- **Match Model** (`src/models/Match.ts`): Stores match data with team information and scores
- **TeamRanking Model** (`src/models/TeamRanking.ts`): Stores team rankings and statistics

### 3. API Routes
- **`/api/matches`**: GET and POST operations for matches
- **`/api/rankings`**: GET and POST operations for team rankings
- **`/api/migrate`**: Migration endpoint to transfer CSV data to MongoDB

### 4. Data Service (`src/services/dataService.ts`)
- Replaces the CSV parser
- Provides clean API for data operations
- Handles data transformation between API and application models

### 5. Migration Page (`src/app/migrate/page.tsx`)
- User-friendly interface for data migration
- Shows migration progress and results

## Setup Instructions

### 1. Install MongoDB
```bash
# Using Docker (recommended)
docker run --name eurobot-mongo -p 27017:27017 -d mongo:latest

# Or install MongoDB locally
# Follow instructions at https://docs.mongodb.com/manual/installation/
```

### 2. Configure Environment Variables
Create or update `.env.local`:
```env
MONGODB_URI=mongodb://localhost:27017/eurobot_dashboard
NEXT_PUBLIC_API_URL=
```

### 3. Install Dependencies
The following packages have been added:
- `mongodb`: Official MongoDB driver
- `mongoose`: ODM for MongoDB

### 4. Migrate Data
1. Start the development server: `npm run dev`
2. Navigate to `/migrate` in your browser
3. Click "Start Migration" to transfer CSV data to MongoDB

## Database Schema

### Matches Collection
```javascript
{
  matchNumber: Number,
  matchId: String,
  team1: {
    name: String,
    id: String,
    score: Number
  },
  team2: {
    name: String,
    id: String,
    score: Number
  },
  winner: String, // 'team1', 'team2', or 'draw'
  series: Number, // 1, 2, or 3
  createdAt: Date,
  updatedAt: Date
}
```

### TeamRankings Collection
```javascript
{
  position: Number,
  name: String,
  standId: String,
  country: String,
  totalPoints: Number,
  matchesPlayed: Number,
  wins: Number,
  draws: Number,
  losses: Number,
  series: Number, // 1, 2, or 3
  createdAt: Date,
  updatedAt: Date
}
```

## Performance Improvements

### Database Indexes
- Compound indexes on `series` and `matchNumber`/`position`
- Indexes on team names for efficient searching
- Index on `totalPoints` for ranking queries

### API Optimizations
- Efficient MongoDB queries with proper filtering
- Connection pooling to reduce database overhead
- Structured error handling and validation

## Benefits of NoSQL Migration

1. **Performance**: Database queries are faster than CSV parsing
2. **Scalability**: Can handle larger datasets efficiently
3. **Data Integrity**: Schema validation and constraints
4. **Real-time Updates**: Easy to add/update data without file manipulation
5. **Advanced Queries**: Complex filtering and aggregation capabilities
6. **Concurrent Access**: Multiple users can access data simultaneously
7. **Data Relationships**: Better handling of related data

## API Usage Examples

### Fetch All Matches
```javascript
const response = await fetch('/api/matches');
const { data } = await response.json();
```

### Fetch Matches for Specific Series
```javascript
const response = await fetch('/api/matches?series=1');
const { data } = await response.json();
```

### Create New Match
```javascript
const response = await fetch('/api/matches', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify(matchData)
});
```

## Migration Notes

- The original CSV files are preserved in `public/data/`
- The old `dataParser.ts` is kept for reference but no longer used
- All existing functionality is maintained with improved performance
- The migration is one-way (CSV → MongoDB)

## Troubleshooting

### Common Issues

1. **Connection Error**: Ensure MongoDB is running and connection string is correct
2. **Migration Fails**: Check that CSV files exist in `public/data/`
3. **Empty Data**: Run the migration process via `/migrate` page
4. **Performance Issues**: Ensure database indexes are created (handled automatically)

### Development Tips

- Use MongoDB Compass for database visualization
- Check browser console for API errors
- Monitor MongoDB logs for query performance
- Use the migration page to reset data if needed

## Future Enhancements

The NoSQL foundation enables several future improvements:
- Real-time data updates with WebSockets
- Advanced analytics and reporting
- User authentication and role-based access
- Data export/import functionality
- Automated data synchronization
- Performance monitoring and optimization
