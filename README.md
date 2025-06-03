# Eurobot 2025 Dashboard

A comprehensive Docker Compose project for visualizing robotics competition data with a React/Next.js frontend, Node.js backend, and MongoDB database.

## 🏗️ Architecture

- **Frontend**: Next.js 15 with TypeScript and Tailwind CSS
- **Backend**: Node.js with Express and Mongoose
- **Database**: MongoDB 7.0
- **Containerization**: Docker Compose
- **Data Visualization**: Recharts library

## 📁 Project Structure

```
eurobot_dashboard/
├── docker-compose.yml          # Docker Compose configuration
├── backend/                    # Node.js backend
│   ├── Dockerfile
│   ├── package.json
│   ├── server.js              # Main server file
│   ├── init-mongo.js          # MongoDB initialization
│   ├── models/                # Mongoose models
│   │   ├── Team.js
│   │   ├── Match.js
│   │   └── Ranking.js
│   └── scripts/
│       └── seed.js            # Database seeding script
├── frontend/                  # Next.js frontend
│   ├── Dockerfile
│   ├── package.json
│   ├── next.config.ts
│   ├── tailwind.config.js
│   └── src/
│       ├── app/               # Next.js app directory
│       │   ├── layout.tsx
│       │   ├── page.tsx       # Dashboard
│       │   ├── rankings/
│       │   ├── matches/
│       │   └── teams/
│       ├── components/
│       │   └── Navbar.tsx
│       └── lib/
│           └── api.ts         # API service
└── data/                      # CSV data files
    ├── classement_serie_1.csv
    ├── classement_serie_2.csv
    ├── classement_serie_3.csv
    ├── matchs_serie_1.csv
    ├── matchs_serie_2.csv
    └── matchs_serie_3.csv
```

## 🚀 Getting Started

### Prerequisites

- Docker and Docker Compose installed
- Git (to clone the repository)

### Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd eurobot_dashboard
   ```

2. **Choose your environment**

   **For Development (Recommended for local development):**
   ```bash
   # Fast startup with hot reloading, no production build
   docker-compose -f docker-compose.dev.yml up --build
   ```

   **For Production:**
   ```bash
   # Full production build (takes longer but optimized)
   docker-compose up --build
   ```

3. **Access the application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000/api
   - MongoDB: localhost:27018 (external access)

### Development vs Production

**Development Setup (`docker-compose.dev.yml`):**
- ✅ Fast startup (no production build)
- ✅ Hot reloading for code changes
- ✅ Volume mounting for instant updates
- ✅ Development environment variables
- ✅ Nodemon for backend auto-restart

**Production Setup (`docker-compose.yml`):**
- 🏗️ Optimized production build
- 🏗️ Minified and optimized assets
- 🏗️ Standalone Next.js output
- 🏗️ Production environment variables
- ⚠️ Longer build times (not ideal for development)

### First Run

On the first startup, the backend will automatically:
- Connect to MongoDB
- Check if the database is empty
- Seed the database with data from CSV files in the `data/` directory

### Database Access with MongoDB Compass

To connect to the MongoDB database using MongoDB Compass:

**Connection String:**
```
mongodb://admin:password123@127.0.0.1:27018/eurobot?authSource=admin&directConnection=true
```

**Or using individual fields:**
- **Hostname:** `127.0.0.1`
- **Port:** `27018`
- **Authentication:** Username/Password
- **Username:** `admin`
- **Password:** `password123`
- **Authentication Database:** `admin`
- **Database Name:** `eurobot`

**Note:** The database is accessible on port 27018 from your host machine, while the internal Docker network uses port 27017.

## 📊 Features

### Dashboard
- Overview statistics (total teams, matches, series)
- Interactive charts showing matches by series
- Top 5 teams leaderboard
- Quick action buttons

### Rankings
- Team standings for each series
- Filterable by series (1, 2, 3)
- Detailed statistics (points, wins, draws, losses)
- Position badges with color coding

### Matches
- Match results display
- Filterable by series
- Visual score comparison
- Match statistics

### Teams
- Complete team directory
- Search functionality
- Filter by country/origin
- Team statistics and information

## 🔧 API Endpoints

### Teams
- `GET /api/teams` - Get all teams
- `GET /api/teams/:id` - Get team by ID

### Matches
- `GET /api/matches` - Get all matches
- `GET /api/matches?serie=X` - Get matches by series
- `GET /api/matches/:id` - Get match by ID

### Rankings
- `GET /api/rankings` - Get all rankings
- `GET /api/rankings?serie=X` - Get rankings by series
- `GET /api/rankings/serie/:serie` - Get rankings for specific series

### Statistics
- `GET /api/stats` - Get dashboard statistics

### Utility
- `GET /api/health` - Health check
- `POST /api/reseed` - Reseed database

## 🗄️ Database Schema

### Teams Collection
```javascript
{
  name: String,        // Team name
  stand: String,       // Stand/booth identifier
  origin: String       // Country/origin
}
```

### Matches Collection
```javascript
{
  matchNumber: Number, // Match identifier
  serie: Number,       // Series number (1, 2, 3)
  team1: {
    name: String,
    stand: String,
    score: Number
  },
  team2: {
    name: String,
    stand: String,
    score: Number
  }
}
```

### Rankings Collection
```javascript
{
  serie: Number,       // Series number
  position: Number,    // Ranking position
  team: {
    name: String,
    stand: String,
    origin: String
  },
  points: Number,      // Total points
  matchesPlayed: Number,
  victories: Number,
  draws: Number,
  defeats: Number
}
```

## 🔄 Data Migration

The project includes automatic data migration from CSV files:

1. **CSV Structure**: The CSV files in the `data/` directory contain:
   - `classement_serie_X.csv`: Team rankings for each series
   - `matchs_serie_X.csv`: Match results for each series

2. **Automatic Seeding**: On startup, if the database is empty, the backend automatically:
   - Parses CSV files
   - Extracts team information
   - Creates match records
   - Generates ranking data
   - Populates the MongoDB collections

3. **Manual Reseeding**: Use the `/api/reseed` endpoint to manually trigger database reseeding

## 🐳 Docker Configuration

### Services

1. **MongoDB** (`eurobot_mongodb`)
   - Image: mongo:7.0
   - Port: 27018 (external) / 27017 (internal)
   - Credentials: admin/password123
   - Persistent volume for data

2. **Backend** (`eurobot_backend`)
   - Node.js application
   - Port: 5000
   - Auto-connects to MongoDB
   - Mounts CSV data directory

3. **Frontend** (`eurobot_frontend`)
   - Next.js application
   - Port: 3000
   - Connects to backend API

### Environment Variables

- `MONGODB_URI`: MongoDB connection string
- `NEXT_PUBLIC_API_URL`: Frontend API endpoint
- `NODE_ENV`: Environment (production/development)

## 🛠️ Development

### Docker Development (Recommended)

**Start development environment:**
```bash
# Start all services with hot reloading
docker-compose -f docker-compose.dev.yml up --build

# Or run in background
docker-compose -f docker-compose.dev.yml up -d --build

# Stop development environment
docker-compose -f docker-compose.dev.yml down
```

**Development features:**
- Hot reloading for both frontend and backend
- Volume mounting for instant code updates
- No production build delays
- Development environment variables

### Local Development (Alternative)

If you prefer to run services locally without Docker:

1. **Start MongoDB only**
   ```bash
   docker-compose up mongodb
   ```

2. **Backend Development**
   ```bash
   cd backend
   npm install
   npm run dev
   ```

3. **Frontend Development**
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

### Docker Files Structure

The project includes separate Docker configurations:

- `docker-compose.yml` - Production setup
- `docker-compose.dev.yml` - Development setup
- `frontend/Dockerfile` - Production frontend build
- `frontend/Dockerfile.dev` - Development frontend (hot reload)
- `backend/Dockerfile` - Production backend build
- `backend/Dockerfile.dev` - Development backend (nodemon)

### Adding New Data

1. Place new CSV files in the `data/` directory
2. Update the seeding script if needed (`backend/scripts/seed.js`)
3. Restart the application or call `/api/reseed`

## 🎨 Styling

The frontend uses Tailwind CSS with a custom configuration:
- Primary colors: Blue palette
- Secondary colors: Gray palette
- Custom components for cards, buttons, and tables
- Responsive design for mobile and desktop

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

## 🔍 Troubleshooting

### Common Issues

1. **Database Connection Issues**
   - Check if MongoDB container is running
   - Verify connection string in environment variables

2. **Frontend API Errors**
   - Ensure backend is running on port 5000
   - Check CORS configuration

3. **Data Not Loading**
   - Verify CSV files are in the correct format
   - Check backend logs for seeding errors

### Logs

View container logs:
```bash
docker-compose logs backend
docker-compose logs frontend
docker-compose logs mongodb
```

## 📄 License

This project is licensed under the MIT License.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Submit a pull request

## 📞 Support

For issues and questions, please create an issue in the repository.
