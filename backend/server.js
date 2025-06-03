const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const Team = require('./models/Team');
const Match = require('./models/Match');
const Ranking = require('./models/Ranking');
const Serie = require('./models/Serie');
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

// Get matches by team name
app.get('/api/teams/:teamName/matches', async (req, res) => {
  try {
    const teamName = decodeURIComponent(req.params.teamName);
    const matches = await Match.find({
      $or: [
        { 'team1.name': teamName },
        { 'team2.name': teamName }
      ]
    }).sort({ serie: 1, matchNumber: 1 });
    res.json(matches);
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

// Series routes

// Get all series
app.get('/api/series', async (req, res) => {
  try {
    const series = await Serie.find().sort({ serieNumber: 1 });
    res.json(series);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get serie by ID
app.get('/api/series/:id', async (req, res) => {
  try {
    const serie = await Serie.findById(req.params.id);
    if (!serie) {
      return res.status(404).json({ error: 'Serie not found' });
    }
    res.json(serie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get serie by number
app.get('/api/series/number/:number', async (req, res) => {
  try {
    const serieNumber = parseInt(req.params.number);
    const serie = await Serie.findOne({ serieNumber });
    if (!serie) {
      return res.status(404).json({ error: 'Serie not found' });
    }
    res.json(serie);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create new serie
app.post('/api/series', async (req, res) => {
  try {
    const serie = new Serie(req.body);
    await serie.save();
    res.status(201).json(serie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Update serie
app.put('/api/series/:id', async (req, res) => {
  try {
    const serie = await Serie.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    if (!serie) {
      return res.status(404).json({ error: 'Serie not found' });
    }
    res.json(serie);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
});

// Delete serie
app.delete('/api/series/:id', async (req, res) => {
  try {
    const serie = await Serie.findByIdAndDelete(req.params.id);
    if (!serie) {
      return res.status(404).json({ error: 'Serie not found' });
    }
    res.json({ message: 'Serie deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get serie statistics
app.get('/api/series/:id/stats', async (req, res) => {
  try {
    const serie = await Serie.findById(req.params.id);
    if (!serie) {
      return res.status(404).json({ error: 'Serie not found' });
    }

    const totalMatches = await Match.countDocuments({ serie: serie.serieNumber });
    const totalTeams = await Ranking.countDocuments({ serie: serie.serieNumber });
    
    const matchStats = await Match.aggregate([
      { $match: { serie: serie.serieNumber } },
      {
        $group: {
          _id: null,
          totalScore: { $sum: { $add: ['$team1.score', '$team2.score'] } },
          avgScore: { $avg: { $add: ['$team1.score', '$team2.score'] } }
        }
      }
    ]);

    res.json({
      serie,
      totalMatches,
      totalTeams,
      totalScore: matchStats[0]?.totalScore || 0,
      averageScore: matchStats[0]?.avgScore || 0
    });
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
    const totalSeries = await Serie.countDocuments();
    
    const matchesBySerie = await Match.aggregate([
      { $group: { _id: '$serie', count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);
    
    // Find the latest serie with rankings
    const latestSerieWithRankings = await Ranking.aggregate([
      { $group: { _id: '$serie' } },
      { $sort: { _id: -1 } },
      { $limit: 1 }
    ]);
    
    const lastKnownSerie = latestSerieWithRankings.length > 0 ? latestSerieWithRankings[0]._id : 1;
    
    const topTeams = await Ranking.find({ serie: lastKnownSerie })
      .sort({ position: 1 })
      .limit(5);
    
    res.json({
      totalTeams,
      totalMatches,
      totalRankings,
      totalSeries,
      matchesBySerie,
      topTeams,
      lastKnownSerie
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
