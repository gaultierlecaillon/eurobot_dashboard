const mongoose = require('mongoose');
const fs = require('fs');
const csv = require('csv-parser');
const path = require('path');

const Team = require('../models/Team');
const Match = require('../models/Match');
const Ranking = require('../models/Ranking');
const Serie = require('../models/Serie');

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://admin:password123@localhost:27018/eurobot?authSource=admin';
const DATA_DIR = path.join(__dirname, '../../data');

/**
 * Discover all CSV files in the data directory and extract series information
 */
function discoverCSVFiles() {
  const files = fs.readdirSync(DATA_DIR);
  const csvFiles = files.filter(file => file.endsWith('.csv'));
  
  const seriesInfo = {
    rankings: new Map(),
    matches: new Map(),
    allSeries: new Set()
  };
  
  csvFiles.forEach(file => {
    const serieMatch = file.match(/(\w+)_serie_(\d+)\.csv/);
    if (serieMatch) {
      const [, type, serieNumber] = serieMatch;
      const serie = parseInt(serieNumber);
      
      seriesInfo.allSeries.add(serie);
      
      if (type === 'classement') {
        seriesInfo.rankings.set(serie, path.join(DATA_DIR, file));
      } else if (type === 'matchs') {
        seriesInfo.matches.set(serie, path.join(DATA_DIR, file));
      }
    }
  });
  
  return seriesInfo;
}

/**
 * Generate basic series metadata from discovered files
 */
function generateSeriesMetadata(seriesNumbers) {
  const currentDate = new Date();
  
  return Array.from(seriesNumbers).sort().map((serieNumber, index) => {
    const daysOffset = (seriesNumbers.size - index) * 10; // Space series 10 days apart
    
    return {
      serieNumber,
      name: `Eurobot 2024 - Serie ${serieNumber}`,
      description: `Serie ${serieNumber} of the Eurobot 2024 competition featuring international robotics teams.`,
      startDate: new Date(currentDate.getTime() - (daysOffset + 5) * 24 * 60 * 60 * 1000),
      endDate: new Date(currentDate.getTime() - daysOffset * 24 * 60 * 60 * 1000),
      status: 'completed',
      location: 'La Roche-sur-Yon, France',
      rules: 'Standard Eurobot 2024 rules apply. Match duration: 100 seconds.'
    };
  });
}

async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('MongoDB connection error:', error);
    process.exit(1);
  }
}

function parseCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';' }))
      .on('data', (data) => results.push(data))
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function seedTeams() {
  console.log('Seeding teams...');
  const teams = new Set();
  const seriesInfo = discoverCSVFiles();
  
  // Extract teams from all ranking files
  for (const [serie, filePath] of seriesInfo.rankings) {
    console.log(`Processing teams from serie ${serie}...`);
    const data = await parseCSV(filePath);
    
    data.forEach(row => {
      if (row['Équipe'] && row['Stand']) {
        const origin = (row['Origine'] || '').trim();
        teams.add(JSON.stringify({
          name: (row['Équipe'] || '').trim(),
          stand: (row['Stand'] || '').trim(),
          origin: origin || 'Unknown'
        }));
      }
    });
  }
  
  // Convert back to objects and save
  const teamObjects = Array.from(teams).map(teamStr => JSON.parse(teamStr));
  
  await Team.deleteMany({});
  await Team.insertMany(teamObjects);
  console.log(`Seeded ${teamObjects.length} teams`);
}

function parseMatchCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    const rawData = [];
    
    fs.createReadStream(filePath)
      .pipe(csv({ separator: ';', headers: false }))
      .on('data', (data) => {
        // Skip header row
        if (data[0] && data[0].includes('#')) {
          return;
        }
        rawData.push(data);
      })
      .on('end', () => {
        // Parse raw data manually
        rawData.forEach((row) => {
          const rowLength = Object.keys(row).length;
          if (rowLength >= 7) {
            const parsed = {
              matchNumber: parseInt(row['0']),
              team1Stand: row['1'],
              team1Name: row['2'],
              team1Score: parseInt(row['3']),
              team2Score: parseInt(row['4']),
              team2Name: row['5'],
              team2Stand: row['6']
            };
            results.push(parsed);
          }
        });
        resolve(results);
      })
      .on('error', reject);
  });
}

async function seedMatches() {
  console.log('Seeding matches...');
  const seriesInfo = discoverCSVFiles();
  
  await Match.deleteMany({});
  
  for (const [serie, filePath] of seriesInfo.matches) {
    console.log(`Processing matches from serie ${serie}...`);
    const data = await parseMatchCSV(filePath);
    
    const matches = data.map(row => ({
      matchNumber: row.matchNumber,
      serie: serie,
      team1: {
        name: row.team1Name ? row.team1Name.trim() : '',
        stand: row.team1Stand ? row.team1Stand.trim() : '',
        score: row.team1Score || 0
      },
      team2: {
        name: row.team2Name ? row.team2Name.trim() : '',
        stand: row.team2Stand ? row.team2Stand.trim() : '',
        score: row.team2Score || 0
      }
    })).filter(match => 
      !isNaN(match.matchNumber) && 
      match.team1.name && 
      match.team2.name &&
      !isNaN(match.team1.score) &&
      !isNaN(match.team2.score)
    );
    
    await Match.insertMany(matches);
    console.log(`Seeded ${matches.length} matches for serie ${serie}`);
  }
}

async function seedRankings() {
  console.log('Seeding rankings...');
  const seriesInfo = discoverCSVFiles();
  
  await Ranking.deleteMany({});
  
  for (const [serie, filePath] of seriesInfo.rankings) {
    console.log(`Processing rankings from serie ${serie}...`);
    const data = await parseCSV(filePath);
    
    const rankings = data.map((row, index) => {
      // For serie 1, position is in the first column (empty key), for serie 2 it's in 'Équipe' initially
      let position = index + 1; // Default fallback
      
      // Try to extract position from the first column or from the team name
      const firstCol = row[''] || row['Équipe'] || '';
      if (typeof firstCol === 'string') {
        const posMatch = firstCol.match(/(\d+)/);
        if (posMatch) {
          position = parseInt(posMatch[1]);
        }
      }
      
      const origin = (row['Origine'] || '').trim();
      return {
        serie: serie,
        position: position,
        team: {
          name: (row['Équipe'] || '').trim(),
          stand: (row['Stand'] || '').trim(),
          origin: origin || 'Unknown'
        },
        points: parseInt(row['Cumul pts.']) || 0,
        matchesPlayed: parseInt(row['Joués']) || 0,
        victories: parseInt(row['Vict.']) || 0,
        draws: parseInt(row['Égal.']) || 0,
        defeats: parseInt(row['Déf.']) || 0
      };
    }).filter(ranking => 
      ranking.team.name && 
      ranking.team.stand
    );
    
    await Ranking.insertMany(rankings);
    console.log(`Seeded ${rankings.length} rankings for serie ${serie}`);
  }
}

async function seedSeries() {
  console.log('Seeding series...');
  const seriesInfo = discoverCSVFiles();
  
  await Serie.deleteMany({});
  
  // Generate series metadata from discovered files
  const seriesMetadata = generateSeriesMetadata(seriesInfo.allSeries);
  
  // Calculate actual stats from CSV data for each series
  const seriesWithStats = await Promise.all(
    seriesMetadata.map(async (serieData) => {
      const serie = serieData.serieNumber;
      let totalTeams = 0;
      let totalMatches = 0;
      
      // Count teams from rankings if available
      if (seriesInfo.rankings.has(serie)) {
        const rankingData = await parseCSV(seriesInfo.rankings.get(serie));
        totalTeams = rankingData.filter(row => 
          row['Équipe'] && row['Stand']
        ).length;
      }
      
      // Count matches if available
      if (seriesInfo.matches.has(serie)) {
        const matchData = await parseMatchCSV(seriesInfo.matches.get(serie));
        totalMatches = matchData.filter(row => 
          !isNaN(row.matchNumber) && 
          row.team1Name && 
          row.team2Name &&
          !isNaN(row.team1Score) &&
          !isNaN(row.team2Score)
        ).length;
      }
      
      return {
        ...serieData,
        totalTeams,
        totalMatches
      };
    })
  );
  
  await Serie.insertMany(seriesWithStats);
  console.log(`Seeded ${seriesWithStats.length} series`);
}

async function seed() {
  try {
    await connectDB();
    
    await seedSeries();
    await seedTeams();
    await seedMatches();
    await seedRankings();
    
    console.log('Database seeding completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeding error:', error);
    process.exit(1);
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
