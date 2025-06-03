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
const CONFIG_DIR = path.join(__dirname, '../config');

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
 * Load series configuration from JSON file
 */
function loadSeriesConfig() {
  try {
    const configPath = path.join(CONFIG_DIR, 'series-config.json');
    const configData = fs.readFileSync(configPath, 'utf8');
    return JSON.parse(configData);
  } catch (error) {
    console.warn('Could not load series configuration:', error.message);
    return { liveStreamUrls: {} };
  }
}

/**
 * Generate basic series metadata from discovered files
 */
function generateSeriesMetadata(seriesNumbers) {
  const currentDate = new Date();
  const config = loadSeriesConfig();
  
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
      rules: 'Standard Eurobot 2024 rules apply. Match duration: 100 seconds.',
      liveStreamUrl: config.liveStreamUrls[serieNumber.toString()] || ''
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
  const teamsMap = new Map(); // Use Map to track teams by name
  const seriesInfo = discoverCSVFiles();
  
  // Extract teams from all ranking files
  for (const [serie, filePath] of seriesInfo.rankings) {
    console.log(`Processing teams from serie ${serie}...`);
    const data = await parseCSV(filePath);
    
    data.forEach(row => {
      if (row['Équipe'] && row['Stand']) {
        const teamName = (row['Équipe'] || '').trim();
        const stand = (row['Stand'] || '').trim();
        const origin = (row['Origine'] || '').trim();
        
        if (teamName && stand) {
          // Check if team already exists
          if (teamsMap.has(teamName)) {
            const existingTeam = teamsMap.get(teamName);
            
            // Update with more complete information
            // Prefer non-empty origin over empty/Unknown
            if (origin && origin !== 'Unknown' && 
                (!existingTeam.origin || existingTeam.origin === 'Unknown' || existingTeam.origin === '')) {
              existingTeam.origin = origin;
            }
            
            // Keep the same stand (should be consistent for same team)
            // But log if there's a discrepancy
            if (existingTeam.stand !== stand) {
              console.warn(`Stand mismatch for team "${teamName}": existing "${existingTeam.stand}" vs new "${stand}"`);
            }
          } else {
            // Add new team
            teamsMap.set(teamName, {
              name: teamName,
              stand: stand,
              origin: origin || 'Unknown'
            });
          }
        }
      }
    });
  }
  
  // Convert to array
  const teamObjects = Array.from(teamsMap.values());
  
  await Team.deleteMany({});
  await Team.insertMany(teamObjects);
  console.log(`Seeded ${teamObjects.length} unique teams`);
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
      let position = index + 1; // Default fallback
      
      // Try to extract position from the first column (which contains French ordinals like "1er", "2nd", "3ème", "99ème")
      const firstCol = row[''] || '';
      if (typeof firstCol === 'string' && firstCol.trim()) {
        // Match French ordinal numbers: "1er", "2nd", "3ème", "4ème", "10ème", "99ème", etc.
        const posMatch = firstCol.match(/^(\d+)(?:er|nd|ème)$/);
        if (posMatch) {
          position = parseInt(posMatch[1]);
        } else {
          // Fallback: try to extract any number from the beginning
          const numMatch = firstCol.match(/^(\d+)/);
          if (numMatch) {
            position = parseInt(numMatch[1]);
          }
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
    
    // Close MongoDB connection
    await mongoose.connection.close();
    console.log('MongoDB connection closed');
    
    // Only exit if this script is run directly, not when called from server.js
    if (require.main === module) {
      process.exit(0);
    }
  } catch (error) {
    console.error('Seeding error:', error);
    
    // Close MongoDB connection on error too
    try {
      await mongoose.connection.close();
    } catch (closeError) {
      console.error('Error closing MongoDB connection:', closeError);
    }
    
    // Only exit if this script is run directly, not when called from server.js
    if (require.main === module) {
      process.exit(1);
    } else {
      throw error; // Re-throw the error for the calling module to handle
    }
  }
}

// Run seeding if this file is executed directly
if (require.main === module) {
  seed();
}

module.exports = { seed };
