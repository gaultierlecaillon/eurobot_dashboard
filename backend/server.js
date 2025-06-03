const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Team = require('./models/Team');
const Match = require('./models/Match');
const Ranking = require('./models/Ranking');
const { seed } = require('./scripts/seed');

const app = express();
const PORT = process.env.PORT || 5000;
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27017/eurobot?authSource=admin';

// Middleware
app.use(cors());
app.use(express.json());

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
    
    // Check if database is empty and seed if necessary
    const teamCount = await Team.countDocuments();
    if (teamCount === 0) {
      console.log('Database is empty, running seed...');
      await seed();
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

// Routes

// Get all teams
app.get('/api/teams', async (req, res) => {
  try {
    const teams = await Team.find().sort({ name: 1 });
    res.json(teams);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get team by ID
app.get('/api/teams/:id', async (req, res) => {
  try {
    const team = await Team.findById(req.params.id);
    if (!team) {
      return res.status(404).json({ error: 'Team not found' });
    }
    res.json(team);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all matches
app.get('/api/matches', async (req, res) => {
  try {
    const { serie } = req.query;
    const filter = serie ? { serie: parseInt(serie) } : {};
    const matches = await Match.find(filter).sort({ serie: 1, matchNumber: 1 });
    res.json(matches);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get match by ID
app.get('/api/matches/:id', async (req, res) => {
  try {
    const match = await Match.findById(req.params.id);
    if (!match) {
      return res.status(404).json({ error: 'Match not found' });
    }
    res.json(match);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get all rankings
app.get('/api/rankings', async (req, res) => {
  try {
    const { serie } = req.query;
    const filter = serie ? { serie: parseInt(serie) } : {};
    const rankings = await Ranking.find(filter).sort({ serie: 1, position: 1 });
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ranking by serie
app.get('/api/rankings/serie/:serie', async (req, res) => {
  try {
    const serie = parseInt(req.params.serie);
    const rankings = await Ranking.find({ serie }).sort({ position: 1 });
    res.json(rankings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get statistics
app.get('/api/stats', async (req, res) => {
  try {
    const totalTeams = await Team.countDocuments();
    const totalMatches = await Match.countDocuments();
    const totalRankings = await Ranking.countDocuments();
    
    const matchesBySerie = await Match.aggregate([
      { $group: { _id: '$serie', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    const topTeams = await Ranking.find({ serie: 3 })
      .sort({ position: 1 })
      .limit(5);
    
    res.json({
      totalTeams,
      totalMatches,
      totalRankings,
      matchesBySerie,
      topTeams
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Reseed database endpoint
app.post('/api/reseed', async (req, res) => {
  try {
    await seed();
    res.json({ message: 'Database reseeded successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Start server
connectDB().then(() => {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
});
